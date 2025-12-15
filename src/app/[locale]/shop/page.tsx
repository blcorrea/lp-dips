import { redirect } from 'next/navigation';

export default function ShopPage({ params }: { params: { locale: string } }) {
  redirect(`/${params.locale}/products`);
}
