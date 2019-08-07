import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import imageIcon from '@ckeditor/ckeditor5-core/theme/icons/image.svg';

export default class InsertImage {
    constructor(editor) {
        this.editor = editor;
    }

    init() {
        const editor = this.editor;

        editor.ui.componentFactory.add('insertImage', locale => {
            const view = new ButtonView(locale);

            view.set({
                label: 'Insert image',
                icon: imageIcon,
                tooltip: true
            });

            // Callback executed once the image is clicked.
            view.on('execute', () => {
                let event = new CustomEvent('selectImage', {'detail': editor});
                document.dispatchEvent(event);
            });

            return view;
        });
    }

}