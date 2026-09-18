
import {
  ChevronDown,
  ChevronRight,
  Search,
  ArrowLeftRight,
  ArrowDownUp,
  Network,
  Layers,
  Code2,
} from "lucide-react";
import { useState } from "react";

const chapters = [
  {
  id: "two-pointers",
  title: "Two Pointers",
  icon: ArrowLeftRight,
  algorithms: [
    {
      id: "two-pointers",
      name: "Opposite Ends",
    },
    {
      id: "two-pointers-same-direction",
      name: "Same Direction",
    },
  ],
},

 

   {
    id: "sliding-window",
    title: "Sliding Window",
    icon: ArrowLeftRight,
    algorithms: [
      {
        id: "sliding-window-fixed",
        name: "Fixed Window",
      },
      {
        id: "sliding-window-variable",
        name: "Variable Window",
      },
      {
        id: "sliding-window-frequency",
        name: "Frequency Window",
      },
    ],
  },

   {
    id: "searching",
    title: "Searching",
    icon: Search,
    algorithms: [
      {
        id: "binary-search",
        name: "Binary Search",
      },
    ],
  },
  {
    id: "graphs",
    title: "Graphs",
    icon: Network,
    algorithms: [
      {
        id: "dijkstra",
        name: "Dijkstra",
      },
      {
        id: "bfs",
        name: "BFS",
        comingSoon: true,
      },
      {
        id: "dfs",
        name: "DFS",
        comingSoon: true,
      },
    ],
  },

 


  {
    id: "sorting",
    title: "Sorting",
    icon: ArrowDownUp,
    algorithms: [
      {
        id: "merge-sort",
        name: "Merge Sort",
        comingSoon: true,
      },
      {
        id: "quick-sort",
        name: "Quick Sort",
        comingSoon: true,
      },
      {
        id: "heap-sort",
        name: "Heap Sort",
        comingSoon: true,
      },
    ],
  },

  {
    id: "dynamic-programming",
    title: "Dynamic Programming",
    icon: Layers,
    algorithms: [
      {
        id: "dp",
        name: "Dynamic Programming",
        comingSoon: true,
      },
    ],
  },
];

function AlgorithmSidebar({
  selectedAlgorithm,
  onSelect,
}) {
  const [openChapters, setOpenChapters] =
    useState({
      searching: true,
      graphs: true,
      "sliding-window": true,
      "two-pointers": true,
      sorting: false,
      "dynamic-programming": false,
    });

  const toggleChapter = (chapterId) => {
    setOpenChapters((previous) => ({
      ...previous,
      [chapterId]:
        !previous[chapterId],
    }));
  };

  return (
    <aside className="algorithm-sidebar">
      <div className="sidebar-header">
 <div
  className="
    grid
    h-9
    w-9
    shrink-0
    place-items-center
    rounded-xl
    text-primary-foreground
    transition-all
    duration-300
    hover:scale-105
    hover:shadow-[0_0_25px_-5px_rgba(59,130,246,0.8)]
  "
  style={{
    background: "var(--gradient-primary)",
    boxShadow: "var(--shadow-elegant)",
  }}
>
  <Code2 className="h-5 w-5" />
</div>

        <div>
          <div className="sidebar-title">
            Dykstra
          </div>

          <div className="sidebar-subtitle">
            Algorithm Visualizer
          </div>
        </div>
      </div>

      <div className="sidebar-divider" />

      <div className="sidebar-content">
        <div className="sidebar-section-title">
          ALGORITHMS
        </div>

        {chapters.map((chapter) => {
          const Icon = chapter.icon;

          const isOpen =
            openChapters[chapter.id];

          return (
            <div
              className="sidebar-chapter"
              key={chapter.id}
            >
              <button
                className="chapter-button"
                onClick={() =>
                  toggleChapter(
                    chapter.id
                  )
                }
              >
                {isOpen ? (
                  <ChevronDown
                    size={14}
                  />
                ) : (
                  <ChevronRight
                    size={14}
                  />
                )}

                <Icon size={15} />

                <span>
                  {chapter.title}
                </span>
              </button>

              {isOpen && (
                <div className="chapter-items">
                  {chapter.algorithms.map(
                    (algorithm) => (
                      <button
                        key={
                          algorithm.id
                        }
                        disabled={
                          algorithm.comingSoon
                        }
                        className={
                          selectedAlgorithm ===
                          algorithm.id
                            ? "sidebar-algorithm active"
                            : "sidebar-algorithm"
                        }
                        onClick={() =>
                          !algorithm.comingSoon &&
                          onSelect(
                            algorithm.id
                          )
                        }
                      >
                        <span className="algorithm-dot" />

                        <span>
                          {
                            algorithm.name
                          }
                        </span>

                        {algorithm.comingSoon && (
                          <span className="coming-soon">
                            Soon
                          </span>
                        )}
                      </button>
                    )
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}

export default AlgorithmSidebar;