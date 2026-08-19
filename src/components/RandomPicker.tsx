import type { Restaurant } from "../types/restaurant";

interface RandomPickerProps {
  restaurants: Restaurant[];
  onPick: (restaurant: Restaurant) => void;
}

export default function RandomPicker({ restaurants, onPick }: RandomPickerProps) {
  const handlePick = () => {
    if (restaurants.length === 0) return;
    const choice = restaurants[Math.floor(Math.random() * restaurants.length)];
    onPick(choice);
    document.getElementById(`card-${choice.id}`)?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  };

  return (
    <button
      type="button"
      className="btn btn--primary btn--random"
      onClick={handlePick}
      disabled={restaurants.length === 0}
    >
      🎲 Pick a random spot ({restaurants.length})
    </button>
  );
}
