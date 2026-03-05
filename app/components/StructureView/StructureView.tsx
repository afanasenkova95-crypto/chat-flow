'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { FigmaIcon, Button } from '@campstudio/camp-ui-kit';
import { SlideStructure } from '@/app/lib/types';
import styles from './StructureView.module.css';

interface StructureViewProps {
  structure: SlideStructure[];
  onUpdate: (structure: SlideStructure[]) => void;
  readonly?: boolean;
}

export default function StructureView({ structure, onUpdate, readonly = false }: StructureViewProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const dragNode = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (editingIdx === null) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setEditingIdx(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [editingIdx]);

  const handleTitleChange = (index: number, newTitle: string) => {
    const updated = [...structure];
    updated[index] = { ...updated[index], title: newTitle };
    onUpdate(updated);
  };

  const handleDescChange = (index: number, newDesc: string) => {
    const updated = [...structure];
    updated[index] = { ...updated[index], description: newDesc };
    onUpdate(updated);
  };

  const handleDelete = (index: number) => {
    const updated = structure
      .filter((_, i) => i !== index)
      .map((s, i) => ({ ...s, number: i + 1 }));
    onUpdate(updated);
    if (editingIdx === index) setEditingIdx(null);
  };

  const handleAddSlide = () => {
    const newSlide: SlideStructure = {
      number: structure.length + 1,
      title: '',
      description: '',
    };
    onUpdate([...structure, newSlide]);
    setEditingIdx(structure.length);
  };

  const handleDragStart = useCallback((e: React.DragEvent<HTMLDivElement>, index: number) => {
    dragNode.current = e.currentTarget;
    setDragIdx(index);
    e.dataTransfer.effectAllowed = 'move';
    requestAnimationFrame(() => {
      if (dragNode.current) {
        dragNode.current.style.opacity = '0.4';
      }
    });
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIdx(index);
  }, []);

  const handleDragEnd = useCallback(() => {
    if (dragNode.current) {
      dragNode.current.style.opacity = '1';
    }
    if (dragIdx !== null && dragOverIdx !== null && dragIdx !== dragOverIdx) {
      const updated = [...structure];
      const [moved] = updated.splice(dragIdx, 1);
      updated.splice(dragOverIdx, 0, moved);
      onUpdate(updated.map((s, i) => ({ ...s, number: i + 1 })));
    }
    setDragIdx(null);
    setDragOverIdx(null);
    dragNode.current = null;
  }, [dragIdx, dragOverIdx, structure, onUpdate]);

  return (
    <div className={styles.container} ref={containerRef}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <FigmaIcon name="format-list-bulleted" size={24} color="#232323" />
          <div className={styles.headerTitleGroup}>
            <span className={styles.headerTitle}>Структура презентации </span>
            {!readonly && (
              <span className={styles.headerHint}>| Отредактируй, я возьму все изменения за основу</span>
            )}
          </div>
        </div>
        <button className={styles.collapseBtn} onClick={() => setCollapsed(!collapsed)}>
          <FigmaIcon
            name={collapsed ? 'down-chevron' : 'up-chevron'}
            size={24}
            color="#232323"
          />
        </button>
      </div>

      {!collapsed && (
        <>
          <div className={styles.divider} />
          <div className={styles.list}>
            {structure.map((slide, index) => (
              <div
                key={index}
                className={`${styles.item} ${dragOverIdx === index && dragIdx !== index ? styles.itemDragOver : ''}`}
                draggable={!readonly}
                onDragStart={readonly ? undefined : (e) => handleDragStart(e, index)}
                onDragOver={readonly ? undefined : (e) => handleDragOver(e, index)}
                onDragEnd={readonly ? undefined : handleDragEnd}
                onMouseEnter={readonly ? undefined : () => setHoveredIdx(index)}
                onMouseLeave={readonly ? undefined : () => setHoveredIdx(null)}
                onClick={readonly ? undefined : () => setEditingIdx(editingIdx === index ? null : index)}
                style={readonly ? { cursor: 'default' } : undefined}
              >
                <div className={styles.number}>{slide.number}</div>
                <div className={`${styles.itemContent} ${!readonly && editingIdx === index ? styles.itemContentEditing : ''}`}>
                  {!readonly && editingIdx === index ? (
                    <>
                      <input
                        className={styles.editInput}
                        value={slide.title}
                        onChange={(e) => handleTitleChange(index, e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        autoFocus
                      />
                      <textarea
                        className={styles.editTextarea}
                        value={slide.description}
                        onChange={(e) => handleDescChange(index, e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        rows={3}
                      />
                    </>
                  ) : (
                    <>
                      <div className={styles.titleRow}>
                        <span className={styles.itemTitle}>{slide.title}</span>
                        {slide.tag && (
                          <span className={styles.itemTag}>{slide.tag}</span>
                        )}
                      </div>
                      {slide.description && (
                        <p className={styles.itemDescription}>{slide.description}</p>
                      )}
                    </>
                  )}
                </div>
                {!readonly && hoveredIdx === index && (
                  <div className={styles.deleteBtn} onClick={(e) => e.stopPropagation()}>
                    <Button
                      size="Small"
                      color="Red on Hover"
                      leftIcon={<FigmaIcon name="delete-empty-outline" size={20} />}
                      onClick={() => handleDelete(index)}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
          {!readonly && (
            <div className={styles.addSlideRow}>
              <button className={styles.addSlideBtn} onClick={handleAddSlide}>
                <FigmaIcon name="plus" size={20} color="#7a7f82" />
                <span className={styles.addSlideText}>Добавить слайд</span>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
