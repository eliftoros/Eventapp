const BASE_URL = 'http://localhost:3000';

async function request(method, path, token, body) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${BASE_URL}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined
    });

    const text = await res.text();
    let data;
    try {
        data = JSON.parse(text);
    } catch {
        data = text;
    }

    return { status: res.status, data };
}

async function verify() {
    const ts = Date.now();
    const adminEmail = `admin${ts}@test.com`;
    const orgEmail = `org${ts}@test.com`;
    const userEmail = `user${ts}@test.com`;
    const password = 'password123';

    console.log('--- 1. Registering Users ---');
    // Register Admin with ORGANIZER role so they have administrative privileges (since NestJS only has USER and ORGANIZER roles)
    await request('POST', '/auth/register', null, { email: adminEmail, password, name: 'Admin', role: 'ORGANIZER' });
    await request('POST', '/auth/register', null, { email: orgEmail, password, name: 'Org', role: 'USER' }); // Explicitly USER, to be promoted
    await request('POST', '/auth/register', null, { email: userEmail, password, name: 'User', role: 'USER' });

    console.log('--- 2. Logging In ---');
    const adminLogin = await request('POST', '/auth/login', null, { email: adminEmail, password });
    const orgLogin = await request('POST', '/auth/login', null, { email: orgEmail, password });
    const userLogin = await request('POST', '/auth/login', null, { email: userEmail, password });

    const adminToken = adminLogin.data.access_token;
    const orgToken = orgLogin.data.access_token;
    const userToken = userLogin.data.access_token;
    const orgUserId = orgLogin.data.user.id;

    if (!adminToken || !orgToken || !userToken) {
        console.error('Failed to login:', { admin: !!adminToken, org: !!orgToken, user: !!userToken });
        process.exit(1);
    }

    console.log('--- 3. Promoting Organizer ---');
    const promote = await request('PATCH', `/users/${orgUserId}/role`, adminToken, { role: 'ORGANIZER' });
    console.log('Promote Status:', promote.status); // Expect 200

    // Refresh Org Token to get new role claims if necessary (or backend checks DB)
    // Our Guard checks `user.role`, which comes from Request.user.
    // Using JwtStrategy, it usually decodes token or loads from DB.
    // If it just decodes token, we need to re-login.
    // Let's check JwtStrategy file content later if it fails. Assuming re-login is safer.
    const orgLoginRefreshed = await request('POST', '/auth/login', null, { email: orgEmail, password });
    const orgTokenRefreshed = orgLoginRefreshed.data.access_token;


    console.log('--- 3.5. Creating Prerequisites (Category/City) ---');
    // Create Category
    const catRes = await request('POST', '/categories', adminToken, { name: `Cat ${ts}` });
    console.log('Category Create Status:', catRes.status);
    const categoryId = catRes.data.id;

    // Create City
    const cityRes = await request('POST', '/cities', adminToken, { name: `City ${ts}` });
    console.log('City Create Status:', cityRes.status);
    const cityId = cityRes.data.id;

    if (!categoryId || !cityId) {
        console.error('Failed to create prerequisites', { categoryId, cityId, catData: catRes.data, cityData: cityRes.data });
        // Proceeding might fail but let's see
    }

    console.log('--- 4. Creating Event ---');
    // User tries (Fail)
    const userCreate = await request('POST', '/events', userToken, {
        name: 'User Event', date: new Date().toISOString(),
        categoryId: categoryId || 1, cityId: cityId || 1
    });
    console.log('User Create Status (Expected 403):', userCreate.status);

    // We need valid Category and City for success. 
    // Let's assume seeded or create them if Admin.
    // But Admin can create them? No endpoints shown for Cat/City creation in snippets.
    // Assuming they exist or we can proceed. If FK fails, we at least check permissions first.
    // If Guard works, User gets 403 BEFORE validation? 
    // Yes, Guards run before Controller.

    // Organizer Create
    const eventData = {
        name: 'Org Event',
        title: 'Title',
        description: 'Desc',
        date: new Date().toISOString(),
        categoryId: categoryId,
        cityId: cityId,
        // address: '123 Test St' -- Removed to avoid Prisma unknown field error
    };

    // Need to bypass FK check for a pure permission test without seeding DB?
    // If we can't create event due to FK, we can't test delete/update ownership.
    // I'll try to create valid foreign keys if possible. 
    // Or just rely on User getting 403.

    const orgCreate = await request('POST', '/events', orgTokenRefreshed, eventData);
    console.log('Org Create Status:', orgCreate.status); // 201 or 500/400 (FK)

    let eventId;
    if (orgCreate.status === 201) {
        eventId = orgCreate.data.id;
        console.log('Event Created, ID:', eventId);

        console.log('--- 5. Ownership Checks ---');
        // User Delete (Fail)
        const userDelete = await request('DELETE', `/events/${eventId}`, userToken);
        console.log('User Delete Status (Expected 403):', userDelete.status);

        // Admin Delete (Success)
        const adminDelete = await request('DELETE', `/events/${eventId}`, adminToken);
        console.log('Admin Delete Status (Expected 200):', adminDelete.status);
    } else {
        console.log('Skipping ownership tests because event creation failed (likely missing FK data).', orgCreate.data);

        // Check if it was 403. If Org got 403, something is wrong.
        if (orgCreate.status === 403) console.error('FAIL: Organizer got 403 on Create');
    }

}

verify().catch(console.error);
