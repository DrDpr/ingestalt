import { ReactRenderer } from '@tiptap/react';
import tippy, { Instance as TippyInstance } from 'tippy.js';
import { SlashCommands, SlashCommandsHandle } from './SlashCommands';
import { SuggestionProps, SuggestionKeyDownProps } from '@tiptap/suggestion';

export const slashCommandSuggestion = (
    onImageInsert?: () => void,
    onYouTubeInsert?: () => void
) => ({
    items: () => [], // Commands are handled in the component
    render: () => {
        let component: ReactRenderer<SlashCommandsHandle> | null = null;
        let popup: TippyInstance[] | null = null;

        return {
            onStart: (props: SuggestionProps) => {
                component = new ReactRenderer(SlashCommands, {
                    props: {
                        ...props,
                        onImageInsert,
                        onYouTubeInsert,
                        onClose: () => {
                            popup?.[0]?.hide();
                        },
                    },
                    editor: props.editor,
                });

                if (!props.clientRect) {
                    return;
                }

                popup = tippy('body', {
                    getReferenceClientRect: props.clientRect as () => DOMRect,
                    appendTo: () => document.body,
                    content: component.element,
                    showOnCreate: true,
                    interactive: true,
                    trigger: 'manual',
                    placement: 'bottom-start',
                    maxWidth: 'none',
                    animation: 'shift-away',
                    duration: [150, 150],
                    theme: 'slash-commands',
                });
            },

            onUpdate(props: SuggestionProps) {
                component?.updateProps({
                    ...props,
                    onImageInsert,
                    onYouTubeInsert,
                    onClose: () => {
                        popup?.[0]?.hide();
                    },
                });

                if (!props.clientRect) {
                    return;
                }

                popup?.[0]?.setProps({
                    getReferenceClientRect: props.clientRect as () => DOMRect,
                });
            },

            onKeyDown(props: SuggestionKeyDownProps) {
                if (props.event.key === 'Escape') {
                    popup?.[0]?.hide();
                    return true;
                }

                return component?.ref?.onKeyDown(props.event) ?? false;
            },

            onExit() {
                popup?.[0]?.destroy();
                component?.destroy();
            },
        };
    },
});
