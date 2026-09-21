import HeroSlideForm from "@/components/admin/HeroSlideForm";

export default function NewHeroSlidePage() {
  return (
    <div>
      <h1 className="font-display text-2xl text-ink">Add carousel slide</h1>
      <div className="mt-6">
        <HeroSlideForm />
      </div>
    </div>
  );
}
