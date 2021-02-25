import { Plugins } from '@capacitor/core';
import { toastController } from '@ionic/vue';

const { Clipboard } = Plugins;


const textToClipboard = function(text: string) {
    Clipboard.write({
        string: text,
    });
    toastController
        .create({
            message: 'Kopiert.',
            duration: 2000
        })
        .then(toast => toast.present());
}


export { textToClipboard }
