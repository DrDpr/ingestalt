'use client';

import { Check, Layers, Trash2, Plus, Zap, ExternalLink } from 'lucide-react';
import { useFileSystem } from '../../lib/hooks/useFileSystem';
import { locateMethodInFile } from '@/app/actions/locate';
import { LocalInput, LocalTextArea } from '../ui/LocalInput';

export const SchemaTable = ({ data, selectedColumns, onToggle, onUpdate }: { data: any[], selectedColumns?: Set<string>, onToggle?: (name: string) => void, onUpdate?: (newData: any[]) => void }) => {
  const tableData = Array.isArray(data) ? data : [];
  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <table className="w-full text-left text-xs">
        <thead className="bg-secondary/50 text-foreground/50 uppercase tracking-tighter">
          <tr>
            {onToggle && <th className="w-8 p-2"></th>}
            <th className="p-2 font-bold">Field / Column</th>
            <th className="p-2 font-bold">Details</th>
            {onUpdate && <th className="w-8 p-2"></th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-800/50">
          {tableData.map((col: any, idx: number) => {
            const colString = typeof col === 'string' ? col : col.name;
            const match = colString.match(/^(.*?)(?:\s*\((.*?)\))?$/);
            const name = match?.[1]?.trim() || colString;
            const details = match?.[2]?.trim() || '';
            const isSelected = selectedColumns?.has(name);

            return (
              <tr key={idx} className={`group transition-colors ${isSelected ? 'bg-blue-900/20' : 'hover:bg-secondary/30'}`}>
                {onToggle && (
                  <td className="p-2 text-center cursor-pointer" onClick={() => onToggle(name)}>
                    <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-blue-500 border-blue-500 text-foreground' : 'border-input'}`}>
                      {isSelected && <Check size={10} strokeWidth={4} />}
                    </div>
                  </td>
                )}
                <td className="p-2 font-mono text-foreground/80 text-xs">
                  {onUpdate ? (
                    <LocalInput
                      value={name}
                      onChange={(val) => {
                        const newData = [...tableData];
                        newData[idx] = `${val}${details ? ` (${details})` : ''}`;
                        onUpdate(newData);
                      }}
                      className="bg-transparent border-none outline-none w-full focus:ring-1 focus:ring-blue-500/50 rounded text-xs"
                    />
                  ) : name}
                </td>
                <td className="p-2 font-mono text-foreground/50 text-xs">
                  {onUpdate ? (
                    <LocalInput
                      value={details}
                      onChange={(val) => {
                        const newData = [...tableData];
                        newData[idx] = `${name}${val ? ` (${val})` : ''}`;
                        onUpdate(newData);
                      }}
                      className="bg-transparent border-none outline-none w-full focus:ring-1 focus:ring-blue-500/50 rounded text-xs"
                      placeholder="e.g. string"
                    />
                  ) : details}
                </td>
                {onUpdate && (
                  <td className="p-2 text-center">
                    <button
                      onClick={() => {
                        const newData = [...tableData];
                        newData.splice(idx, 1);
                        onUpdate(newData);
                      }}
                      className="text-foreground/50 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={12} />
                    </button>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
      {onUpdate && (
        <button
          onClick={() => {
            const newData = [...tableData, 'new_column (type)'];
            onUpdate(newData);
          }}
          className="w-full p-2 text-xs font-bold uppercase  text-foreground/50 hover:text-blue-400 hover:bg-secondary/50 border-t border-border transition-colors flex items-center justify-center gap-1"
        >
          <Plus size={10} /> Add Column
        </button>
      )}
    </div>
  );
};

export const TablesList = ({ data, selectedColumns, onToggle, onUpdate }: { data: any[], selectedColumns?: Set<string>, onToggle?: (name: string) => void, onUpdate?: (newData: any[]) => void }) => {
  const tables = Array.isArray(data) ? data : [];
  return (
    <div className="space-y-3">
      {tables.map((table: any, idx: number) => {
        const isString = typeof table === 'string';
        const tableName = isString ? table : (table.name || 'untitled');
        const tableData = isString ? [] : (table.columns || table.indices || []);

        return (
          <div key={idx} className="bg-card border border-border rounded-lg overflow-hidden group/table">
            <div className="bg-secondary/50 px-3 py-2 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2 flex-1 mr-2">
                <Layers size={12} className="text-blue-400" />
                {onUpdate && !isString ? (
                  <LocalInput
                    value={tableName}
                    onChange={(val) => {
                      const newData = [...tables];
                      newData[idx] = { ...table, name: val };
                      onUpdate(newData);
                    }}
                    className="bg-transparent border-none outline-none text-xs font-bold text-foreground/60 font-mono focus:ring-1 focus:ring-blue-500/50 rounded w-full uppercase "
                  />
                ) : (
                  <span className="text-xs font-bold text-foreground/60 font-mono uppercase ">{tableName}</span>
                )}
              </div>
              {onUpdate && (
                <button
                  onClick={() => {
                    const newData = [...tables];
                    newData.splice(idx, 1);
                    onUpdate(newData);
                  }}
                  className="text-foreground/50 hover:text-red-400 opacity-0 group-hover/table:opacity-100 transition-opacity"
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>

            <div className="p-0 border-t-0">
              <SchemaTable
                data={tableData}
                selectedColumns={selectedColumns}
                onToggle={onToggle}
                onUpdate={onUpdate ? (newColumns) => {
                  const newData = [...tables];
                  newData[idx] = { ...table, columns: newColumns };
                  onUpdate(newData);
                } : undefined}
              />
            </div>
          </div>
        );
      })}
      {onUpdate && (
        <button
          onClick={() => {
            const newData = [...tables, { name: 'new_table', columns: [] }];
            onUpdate(newData);
          }}
          className="w-full p-2 rounded-lg border border-dashed border-input text-xs font-bold uppercase  text-foreground/50 hover:text-blue-400 hover:border-blue-500/50 transition-colors flex items-center justify-center gap-1"
        >
          <Plus size={12} /> Add Table
        </button>
      )}
    </div>
  );
};

export const InterfaceList = ({ data, filePath, onAction, onUpdate, onAlert }: { data: any[], filePath?: string, onAction?: (callback: () => void) => void, onUpdate?: (newData: any[]) => void, onAlert?: (msg: string) => void }) => {
  const { openInCode } = useFileSystem();
  const items = Array.isArray(data) ? data : [];

  const handleJump = async (methodName: string) => {
    if (!filePath) {
      if (onAlert) onAlert("No file path associated with this node to jump to.");
      else alert("No file path associated with this node to jump to.");
      return;
    }
    const performJump = async () => {
      const result = await locateMethodInFile(filePath, methodName);
      if (result.success && result.line) openInCode(filePath, result.line);
      else openInCode(filePath);
    };
    if (onAction) onAction(performJump);
    else performJump();
  };

  return (
    <div className="space-y-2">
      {items.map((item: any, i: number) => (
        <div key={i} className="flex gap-2 items-start group">
          <div className="flex-1 text-left bg-green-950/5 border border-green-600/10 rounded-lg p-3 hover:bg-green-600/20 hover:border-green-500/30 transition-all group/btn">
            <div className="flex items-center justify-between mb-1">
              {onUpdate ? (
                <LocalInput
                  value={item.name}
                  onChange={(val) => {
                    const newData = [...items];
                    newData[i] = { ...item, name: val };
                    onUpdate(newData);
                  }}
                  className="bg-transparent border-none outline-none text-sm text-green-400 font-mono font-bold focus:ring-1 focus:ring-green-500/50 rounded w-full"
                />
              ) : (
                <div className="text-sm text-green-400 font-mono font-bold">{item.name}()</div>
              )}
              <button onClick={() => handleJump(item.name)} className="text-green-600 opacity-0 group-hover/btn:opacity-100 transition-opacity ml-2" title="Jump to Code">
                <Zap size={12} />
              </button>
            </div>
            {onUpdate ? (
              <LocalInput
                value={item.description || ''}
                onChange={(val) => {
                  const newData = [...items];
                  newData[i] = { ...item, description: val };
                  onUpdate(newData);
                }}
                className="bg-transparent border-none outline-none text-xs text-foreground/50 w-full focus:ring-1 focus:ring-green-500/50 rounded"
                placeholder="Description..."
              />
            ) : (
              <div className="text-xs text-foreground/50 leading-relaxed group-hover/btn:text-foreground/65 transition-colors">
                {item.description}
              </div>
            )}
          </div>
          {onUpdate && (
            <button
              onClick={() => {
                const newData = [...items];
                newData.splice(i, 1);
                onUpdate(newData);
              }}
              className="p-2 text-foreground/70 hover:text-red-400 hover:bg-red-500/10 rounded opacity-0 group-hover:opacity-100 transition-all mt-1"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      ))}
      {onUpdate && (
        <button
          onClick={() => {
            const newData = [...items, { name: 'newMethod', description: 'Method description' }];
            onUpdate(newData);
          }}
          className="w-full p-2 rounded-lg border border-dashed border-input text-xs font-bold uppercase  text-foreground/50 hover:text-green-400 hover:border-green-500/50 transition-colors flex items-center justify-center gap-1"
        >
          <Plus size={12} /> Add Interface Method
        </button>
      )}
    </div>
  );
};

export const CodeList = ({ data, onUpdate, onAlert }: { data: any[], onUpdate?: (newData: any[]) => void, onAlert?: (title: string, msg: string) => void }) => {
  const items = Array.isArray(data) ? data : [];
  return (
    <div className="space-y-3">
      {items.map((snip: any, i: number) => (
        <div key={i} className="bg-card border border-border rounded-lg overflow-hidden group">
          <div className="bg-secondary/50 px-3 py-1.5 text-xs font-bold text-foreground/50 border-b border-border flex justify-between items-center">
            {onUpdate ? (
              <LocalInput
                value={snip.name || ''}
                onChange={(val) => {
                  const newData = [...items];
                  newData[i] = { ...snip, name: val };
                  onUpdate(newData);
                }}
                className="bg-transparent border-none outline-none uppercase  text-foreground/65 focus:ring-1 focus:ring-blue-500/50 rounded flex-1 mr-2 text-xs"
                placeholder="Snippet Name"
              />
            ) : (
              <span className="uppercase  text-xs">{snip.name || 'Snippet'}</span>
            )}
            <div className="flex gap-2">
              <button onClick={() => { 
                navigator.clipboard.writeText(snip.code); 
                if (onAlert) onAlert('COPIED', 'Snippet code has been successfully copied to your clipboard.');
                else alert('Copied!'); 
              }} className="hover:text-foreground transition-colors text-xs">COPY</button>
              {onUpdate && (
                <button
                  onClick={() => {
                    const newData = [...items];
                    newData.splice(i, 1);
                    onUpdate(newData);
                  }}
                  className="hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={10} />
                </button>
              )}
            </div>
          </div>
          {onUpdate ? (
            <LocalTextArea
              value={snip.code || ''}
              onChange={(val) => {
                const newData = [...items];
                newData[i] = { ...snip, code: val };
                onUpdate(newData);
              }}
              className="w-full p-3 text-xs font-mono text-blue-200/80 bg-black/20 border-none outline-none resize-y min-h-[60px]"
            />
          ) : (
            <pre className="p-3 text-xs font-mono text-blue-200/80 overflow-x-auto bg-black/20"><code>{snip.code}</code></pre>
          )}
        </div>
      ))}
      {onUpdate && (
        <button
          onClick={() => {
            const newData = [...items, { name: 'Snippet', code: '// code here' }];
            onUpdate(newData);
          }}
          className="w-full p-2 rounded-lg border border-dashed border-input text-xs font-bold uppercase  text-foreground/50 hover:text-blue-400 hover:border-blue-500/50 transition-colors flex items-center justify-center gap-1"
        >
          <Plus size={12} /> Add Code Snippet
        </button>
      )}
    </div>
  );
};

export const UserStoryList = ({ data, onUpdate }: { data: any[], onUpdate?: (newData: any[]) => void }) => {
  const stories = Array.isArray(data) ? data : [];
  return (
    <div className="space-y-2">
      {stories.map((story: any, i: number) => {
        const text = typeof story === 'string' ? story : story.text;
        const isDone = typeof story === 'string' ? false : !!story.done;

        return (
          <div key={i} className="flex gap-2 items-center group bg-card/30 p-2.5 rounded border border-border/50 hover:border-amber-500/30 transition-all">
            <button
              onClick={() => {
                if (!onUpdate) return;
                const newData = [...stories];
                newData[i] = typeof story === 'string' ? { text: story, done: true } : { ...story, done: !story.done };
                onUpdate(newData);
              }}
              className={`w-4 h-4 rounded border flex items-center justify-center transition-colors flex-shrink-0 ${isDone ? 'bg-amber-500 border-amber-500 text-black' : 'border-input hover:border-amber-500/50'}`}
            >
              {isDone && <Check size={10} strokeWidth={4} />}
            </button>
            <div className="flex-1">
              {onUpdate ? (
                <LocalInput
                  value={text}
                  onChange={(val) => {
                    const newData = [...stories];
                    newData[i] = typeof story === 'string' ? val : { ...story, text: val };
                    onUpdate(newData);
                  }}
                  className={`bg-transparent border-none outline-none text-xs w-full focus:ring-1 focus:ring-amber-500/50 rounded ${isDone ? 'text-foreground/50 line-through' : 'text-foreground/60'}`}
                  placeholder="As a user, I want to..."
                />
              ) : (
                <span className={`text-xs ${isDone ? 'text-foreground/50 line-through' : 'text-foreground/60'}`}>{text}</span>
              )}
            </div>
            {onUpdate && (
              <button
                onClick={() => {
                  const newData = [...stories];
                  newData.splice(i, 1);
                  onUpdate(newData);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-opacity"
              >
                <Trash2 size={12} />
              </button>
            )}
          </div>
        );
      })}
      {onUpdate && (
        <button
          onClick={() => {
            const newData = [...stories, "As a user, I want to..."];
            onUpdate(newData);
          }}
          className="w-full p-2 text-xs font-bold uppercase  text-foreground/50 hover:text-amber-400 hover:bg-secondary/50 border border-dashed border-input rounded transition-colors flex items-center justify-center gap-1"
        >
          <Plus size={10} /> Add User Story
        </button>
      )}
    </div>
  );
};

export const ProcessFlowList = ({ data, onUpdate }: { data: any[], onUpdate?: (newData: any[]) => void }) => {
  const steps = Array.isArray(data) ? data : [];
  return (
    <div className="space-y-3 relative">
      {/* Connector Line */}
      <div className="absolute left-4 top-4 bottom-4 w-[1px] bg-secondary z-0" />

      {steps.map((step: any, i: number) => (
        <div key={i} className="flex gap-3 items-start group relative z-10">
          <div className="w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center text-xs font-bold text-blue-400 shrink-0 group-hover:border-blue-500/50 transition-colors">
            {i + 1}
          </div>
          <div className="flex-1 bg-card/50 border border-border/50 rounded-lg p-3 group-hover:border-blue-500/20 transition-all">
            {onUpdate ? (
              <div className="space-y-1">
                <LocalInput
                  value={step.action || ''}
                  onChange={(val) => {
                    const newData = [...steps];
                    newData[i] = { ...step, action: val };
                    onUpdate(newData);
                  }}
                  className="bg-transparent border-none outline-none text-sm font-bold text-foreground/80 w-full focus:ring-1 focus:ring-blue-500/50 rounded"
                  placeholder="Action / Step"
                />
                <LocalTextArea
                  value={step.description || ''}
                  onChange={(val) => {
                    const newData = [...steps];
                    newData[i] = { ...step, description: val };
                    onUpdate(newData);
                  }}
                  className="bg-transparent border-none outline-none text-xs text-foreground/50 w-full focus:ring-1 focus:ring-blue-500/50 rounded min-h-[40px] resize-none"
                  placeholder="How it works..."
                />
              </div>
            ) : (
              <div>
                <div className="text-sm font-bold text-foreground/80">{step.action}</div>
                <div className="text-xs text-foreground/50 mt-0.5">{step.description}</div>
              </div>
            )}
          </div>
          {onUpdate && (
            <button
              onClick={() => {
                const newData = [...steps];
                newData.splice(i, 1);
                onUpdate(newData);
              }}
              className="opacity-0 group-hover:opacity-100 p-2 text-foreground/70 hover:text-red-400 transition-opacity"
            >
              <Trash2 size={12} />
            </button>
          )}
        </div>
      ))}
      {onUpdate && (
        <button
          onClick={() => {
            const newData = [...steps, { action: 'New Step', description: 'Step details' }];
            onUpdate(newData);
          }}
          className="w-full ml-11 p-2 text-xs font-bold uppercase  text-foreground/50 hover:text-blue-400 hover:bg-secondary/50 border border-dashed border-input rounded transition-colors flex items-center justify-center gap-1"
        >
          <Plus size={10} /> Add Step
        </button>
      )}
    </div>
  );
};
