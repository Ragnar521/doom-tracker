import { useBoost } from '../contexts/BoostContext';

export default function BoostButton() {
  const { triggerBoost, isBoostActive } = useBoost();

  return (
    <button
      onClick={triggerBoost}
      disabled={isBoostActive}
      className={`doom-button w-full p-3 text-white font-bold text-sm tracking-wider ${
        isBoostActive ? 'boost-active' : ''
      }`}
    >
      {isBoostActive ? '🔥 BOOSTED 🔥' : 'BOOST MOTIVATION'}
    </button>
  );
}
