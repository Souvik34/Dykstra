import {
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Volume2,
  VolumeX,
} from "lucide-react";

function Controls({
  currentStep,
  totalSteps,
  isPlaying,
  soundEnabled,
  onNext,
  onPrevious,
  onReset,
  onTogglePlay,
  onToggleSound,
}) {
  const atStart =
    currentStep === 0;

  const atEnd =
    currentStep >=
    totalSteps - 1;

  return (
    <div className="visualization-controls">
      <div className="control-left">
        <button
          className="control-button"
          onClick={onReset}
          title="Reset"
        >
          <RotateCcw size={16} />
        </button>

        <button
          className="control-button"
          onClick={onPrevious}
          disabled={atStart}
          title="Previous step"
        >
          <ChevronLeft size={18} />
        </button>

        <button
          className="play-button"
          onClick={
            onTogglePlay
          }
          title={
            isPlaying
              ? "Pause"
              : "Play"
          }
        >
          {isPlaying ? (
            <Pause size={17} />
          ) : (
            <Play size={17} />
          )}

          <span>
            {isPlaying
              ? "Pause"
              : "Play"}
          </span>
        </button>

        <button
          className="control-button"
          onClick={onNext}
          disabled={atEnd}
          title="Next step"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="step-progress">
        <span>
          Step {currentStep + 1}
        </span>

        <span className="step-separator">
          /
        </span>

        <span>
          {totalSteps}
        </span>
      </div>

      <button
        className="control-button"
        onClick={
          onToggleSound
        }
        title={
          soundEnabled
            ? "Mute"
            : "Enable sound"
        }
      >
        {soundEnabled ? (
          <Volume2 size={17} />
        ) : (
          <VolumeX size={17} />
        )}
      </button>
    </div>
  );
}

export default Controls;