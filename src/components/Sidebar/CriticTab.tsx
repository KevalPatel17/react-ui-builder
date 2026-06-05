import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Sparkles, Wand2, Eye } from 'lucide-react';
import { useBuilderStore } from '../../store/builderStore';

interface Criticism {
  id: string;
  elementId: string;
  elementName: string;
  type: 'critical' | 'warning' | 'info';
  message: string;
  description: string;
  fixable: boolean;
  fixAction: () => void;
}

export const CriticTab: React.FC = () => {
  const { elements, updateElement, selectElements, saveToHistory } = useBuilderStore();
  const [criticisms, setCriticisms] = useState<Criticism[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [hasRun, setHasRun] = useState(false);

  // Helper: Hex color brightness calculation
  const getBrightness = (hex: string): number => {
    const cleanHex = hex.replace('#', '').trim();
    if (cleanHex.length === 3) {
      const r = parseInt(cleanHex[0] + cleanHex[0], 16);
      const g = parseInt(cleanHex[1] + cleanHex[1], 16);
      const b = parseInt(cleanHex[2] + cleanHex[2], 16);
      return (r * 299 + g * 587 + b * 114) / 1000;
    } else if (cleanHex.length === 6) {
      const r = parseInt(cleanHex.substring(0, 2), 16);
      const g = parseInt(cleanHex.substring(2, 4), 16);
      const b = parseInt(cleanHex.substring(4, 6), 16);
      return (r * 299 + g * 587 + b * 114) / 1000;
    }
    return -1; // Unknown/fallback
  };

  // Run the Heuristic static analysis check on current elements in the store
  const performCheck = () => {
    const currentElements = useBuilderStore.getState().elements;
    const results: Criticism[] = [];

    currentElements.forEach((el) => {
      if (el.hidden) return;

      // 1. Check Touch Target Size
      const isInteractive =
        el.type.includes('btn') ||
        el.type === 'checkbox' ||
        el.type === 'toggle-switch' ||
        el.type === 'select';
      
      if (isInteractive && (el.width < 40 || el.height < 40)) {
        results.push({
          id: `target-${el.id}`,
          elementId: el.id,
          elementName: el.name,
          type: 'warning',
          message: 'Touch target size too small',
          description: `Interactive elements should be at least 44x44px. Current size is ${el.width}x${el.height}px.`,
          fixable: true,
          fixAction: () => {
            // Retrieve latest element from store to avoid stale updates
            const latest = useBuilderStore.getState().elements.find(x => x.id === el.id);
            if (latest) {
              updateElement(el.id, {
                width: Math.max(latest.width, 44),
                height: Math.max(latest.height, 44),
              });
            }
          },
        });
      }

      // 2. Check Missing Labels
      if (el.type.includes('input') && el.type !== 'btn-group') {
        if (!el.props.label || !el.props.label.trim()) {
          results.push({
            id: `label-${el.id}`,
            elementId: el.id,
            elementName: el.name,
            type: 'warning',
            message: 'Missing form field label',
            description: 'Form input fields require a text label for accessibility screen readers.',
            fixable: true,
            fixAction: () => {
              const latest = useBuilderStore.getState().elements.find(x => x.id === el.id);
              if (latest) {
                updateElement(el.id, {
                  props: { ...latest.props, label: 'Input Label' },
                });
              }
            },
          });
        }
      }

      // 3. Contrast Check
      const bgHex = el.style.backgroundColor;
      const textHex = el.style.textColor;
      if (bgHex && textHex && bgHex.startsWith('#') && textHex.startsWith('#')) {
        const bgB = getBrightness(bgHex);
        const textB = getBrightness(textHex);
        if (bgB !== -1 && textB !== -1 && Math.abs(bgB - textB) < 55) {
          results.push({
            id: `contrast-${el.id}`,
            elementId: el.id,
            elementName: el.name,
            type: 'warning',
            message: 'Low text contrast ratio',
            description: 'Text contrast between background and text color is low. This will impact readability.',
            fixable: true,
            fixAction: () => {
              const latest = useBuilderStore.getState().elements.find(x => x.id === el.id);
              if (latest) {
                const bB = getBrightness(latest.style.backgroundColor || '');
                const isBgDark = bB !== -1 ? bB < 128 : true;
                updateElement(el.id, {
                  style: {
                    ...latest.style,
                    textColor: isBgDark ? '#ffffff' : '#111827',
                  },
                });
              }
            },
          });
        }
      }

      // 4. Overlap Detection (Check against sibling boundaries)
      const siblings = currentElements.filter(
        (sib) => sib.id !== el.id && sib.parentId === el.parentId && !sib.hidden
      );
      siblings.forEach((sib) => {
        // Bounding Box Collision
        const overlapX = el.x < sib.x + sib.width && el.x + el.width > sib.x;
        const overlapY = el.y < sib.y + sib.height && el.y + el.height > sib.y;
        
        if (overlapX && overlapY) {
          const alreadyLogged = results.some(
            (r) => r.id === `overlap-${el.id}-${sib.id}` || r.id === `overlap-${sib.id}-${el.id}`
          );
          if (!alreadyLogged) {
            results.push({
              id: `overlap-${el.id}-${sib.id}`,
              elementId: el.id,
              elementName: el.name,
              type: 'critical',
              message: 'Elements overlapping bounds',
              description: `"${el.name}" overlaps with "${sib.name}". This breaks responsive flows.`,
              fixable: true,
              fixAction: () => {
                const latestEl = useBuilderStore.getState().elements.find(x => x.id === el.id);
                const latestSib = useBuilderStore.getState().elements.find(x => x.id === sib.id);
                if (latestEl && latestSib) {
                  const overlapHeight = Math.min(latestEl.y + latestEl.height, latestSib.y + latestSib.height) - Math.max(latestEl.y, latestSib.y);
                  updateElement(latestSib.id, {
                    y: Math.round((latestSib.y + overlapHeight + 8) / 8) * 8,
                  });
                }
              },
            });
          }
        }
      });
    });

    setCriticisms(results);
  };

  const runAnalysis = () => {
    setAnalyzing(true);
    setTimeout(() => {
      performCheck();
      setAnalyzing(false);
      setHasRun(true);
    }, 800);
  };

  // Silent automatic refresh when elements' styling or sizing changes in the store
  useEffect(() => {
    if (hasRun) {
      const timeout = setTimeout(() => {
        performCheck();
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [elements]);

  const handleFix = (crit: Criticism) => {
    crit.fixAction();
    saveToHistory();
  };

  const fixAll = () => {
    const fixable = criticisms.filter(c => c.fixable);
    if (fixable.length === 0) return;
    fixable.forEach(c => c.fixAction());
    saveToHistory();
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 no-scrollbar flex flex-col h-full select-none">
      {/* Action Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={runAnalysis}
          disabled={analyzing}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-lg text-xs font-black shadow-md shadow-indigo-600/15 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
        >
          <Sparkles className={`w-4 h-4 ${analyzing ? 'animate-spin' : ''}`} />
          <span>{analyzing ? 'Analyzing Canvas...' : 'Analyze Canvas Design'}</span>
        </button>

        {hasRun && criticisms.some(c => c.fixable) && (
          <button
            onClick={fixAll}
            className="flex items-center justify-center gap-1.5 p-2.5 bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/20 text-emerald-400 hover:text-emerald-300 rounded-lg text-xs font-bold transition-all cursor-pointer"
            title="Auto-Fix All Issues"
          >
            <Wand2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Analysis Results View */}
      <div className="flex-1 space-y-3">
        {!hasRun ? (
          <div className="text-center py-16 text-gray-500 space-y-3 border border-dashed border-[#1f202c] rounded-xl bg-[#0b0c11]/30">
            <Sparkles className="w-8 h-8 text-gray-600 mx-auto" />
            <div className="text-xs font-semibold text-gray-400">Ready to audit</div>
            <p className="text-[10px] text-gray-500 max-w-[200px] mx-auto leading-relaxed">
              Click Analyze to run checks on accessibility touch targets, inputs labelling, element overlaps, and color contrast ratios.
            </p>
          </div>
        ) : criticisms.length === 0 ? (
          <div className="text-center py-16 text-emerald-500 space-y-3 border border-[#10b981]/15 rounded-xl bg-emerald-500/5">
            <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto animate-bounce" />
            <div className="text-xs font-black uppercase tracking-wider">Perfect Harmony!</div>
            <p className="text-[10px] text-gray-400 max-w-[180px] mx-auto leading-relaxed">
              All accessibility checks passed. No overlapping siblings or low contrast thresholds detected.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            <div className="flex justify-between items-center px-1 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              <span>Audits found ({criticisms.length})</span>
              <span className="text-indigo-400 font-mono">Heuristic v1.0</span>
            </div>

            <div className="space-y-2">
              {criticisms.map((crit) => (
                <div
                  key={crit.id}
                  onClick={() => selectElements([crit.elementId])}
                  className={`group p-3 rounded-lg border text-left cursor-pointer transition-all hover:translate-x-0.5 ${
                    crit.type === 'critical'
                      ? 'bg-rose-500/5 border-rose-500/20 hover:border-rose-500/40 text-rose-300'
                      : crit.type === 'warning'
                      ? 'bg-amber-500/5 border-amber-500/20 hover:border-amber-500/40 text-amber-300'
                      : 'bg-indigo-500/5 border-indigo-500/20 hover:border-indigo-500/40 text-indigo-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>{crit.message}</span>
                    </div>
                    <span className="text-[8px] font-mono uppercase bg-gray-950 px-1 py-0.5 rounded border border-gray-900 text-gray-400 shrink-0">
                      {crit.elementName}
                    </span>
                  </div>
                  
                  <p className="text-[10px] text-gray-400 mt-1 leading-relaxed">
                    {crit.description}
                  </p>

                  {crit.fixable && (
                    <div className="mt-2.5 flex items-center justify-between border-t border-gray-800/60 pt-2 opacity-80 group-hover:opacity-100 transition-opacity">
                      <span className="text-[8px] text-gray-500 flex items-center gap-1">
                        <Eye className="w-3 h-3" /> Click layer to highlight
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFix(crit);
                        }}
                        className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 hover:bg-emerald-500/25 border border-emerald-500/20 text-emerald-400 text-[9px] font-bold uppercase transition-all"
                      >
                        <Wand2 className="w-3 h-3" /> Auto-Fix
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
