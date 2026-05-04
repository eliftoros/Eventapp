import { Redirect } from 'expo-router';

export default function Index() {
  // Şimdilik uygulamayı açar açmaz direkt Login ekranına yönlendiriyoruz.
  // İleride buraya "Eğer token varsa /(tabs)'a git, yoksa /login'e git" mantığı ekleyeceğiz.
  return <Redirect href="/login" />;
}
