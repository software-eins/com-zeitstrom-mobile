<template>
  <div class="flex items-center w-full" @click="handleItemClick()">
    <div class="hidden">
      <img src="../../_testdata/receipt.jpg" />
    </div>

    <div class="flex-grow">
      <ion-label>{{ label }}</ion-label>
    </div>

    <div v-if="!pdfUrl" class="text-gray-400 flex items-center pr-2">
      Scannen
    </div>

    <ion-icon
      class="text-gray-400"
      :ios="chevronForwardOutline"
      :md="chevronForwardOutline"
      v-if="!isLoadingPreview"
    ></ion-icon>

    <ion-spinner v-if="isLoadingPreview" />

    <teleport to="#scan-overlay" v-if="pdfUrl && previewPdf">
      <ion-page>
        <ion-header>
          <ion-toolbar>
            <ion-buttons slot="start">
              <ion-back-button default-href="/" text="Zurück" @click="previewPdf = undefined"></ion-back-button>
            </ion-buttons>
            <ion-buttons slot="end" v-if="!isUploading">
              <ion-button color="primary" @click="pdfUrl = null; previewPdf = undefined">
                Löschen
              </ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content>
          <div class="px-4">
            <PDFPreview
              v-for="idx in previewPdf.numPages" :key="idx"
              :pdf="previewPdf"
              :page="idx"
              class="max-w-full my-4 shadow"
            />
          </div>
        </ion-content>
      </ion-page>
    </teleport>

    <teleport to="#scan-overlay" v-if="activeImageIdx > -1">
      <ion-page>
        <ion-header>
          <ion-toolbar>
            <ion-buttons slot="start">
              <ion-back-button default-href="/" text="Zurück" @click="activeImageIdx = -1"></ion-back-button>
            </ion-buttons>
            <ion-buttons slot="end" v-if="!isUploading">
              <ion-button color="primary" @click="removeAttachmentIdx(activeImageIdx)">
                <ion-icon slot="icon-only" :ios="trashOutline" :md="trashOutline"></ion-icon>
              </ion-button>
              <ion-button color="primary" @click="uploadPdf()">Fertig</ion-button>
            </ion-buttons>
            <ion-buttons slot="end" v-if="isUploading">
              <ion-button color="primary">
                <ion-spinner />
              </ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>

        <ion-content :scrollY="false">
          <div class="w-full h-full flex items-center justify-center relative">
            <swiper
              :slides-per-view="1"
              @swiper="swiperInit"
              :initialSlide="activeImageIdx"
              @slideChange="imageSwipe($event)"
            >
              <swiper-slide
                v-for="attachment, idx of attachments"
                :key="idx"
              >
                <div class="flex items-center justify-center w-full">
                  <img :src="getUrl(attachment)" />
                </div>
              </swiper-slide>
            </swiper>
          </div>
        </ion-content>

        <ion-footer>
          <ion-toolbar>
            <swiper
              :slides-per-view="4"
              :space-between="0"
              @swiper="swiperPreviewInit"
              :initialSlide="activeImageIdx"
              :centerInsufficientSlides="true"
              :centeredSlides="true"
              :centeredSlidesBounds="true"
            >
              <swiper-slide
                v-for="attachment, idx of attachments"
                :key="idx"
              >
                <div
                  class="flex items-center justify-center w-full h-32 p-2"
                  @click="activeImageIdx = idx"
                >
                  <div
                    class="w-full h-full bg-center bg-cover"
                    :class="{'ring ring-primary': activeImageIdx == idx}"
                    :style="{'background-image': 'url(' + getUrl(attachment) + ')'}"
                  >
                    <img
                      :src="getUrl(attachment)"
                      class="opacity-0"
                      :class="{'ring ring-primary': activeImageIdx == idx}"
                    />
                  </div>
                </div>
              </swiper-slide>
              <swiper-slide v-if="!isUploading">
                <div class="w-full h-32 p-2">
                  <div
                    @click="addAttachment()"
                    class="w-full h-full border-dashed border-2 flex flex-col items-center justify-center p-2"
                  >
                    <ion-icon :ios="addCircleOutline" :md="addCircleOutline" class="w-6 h-6" />
                    <div class="text-sm mt-2 text-center">Neue Seite</div>
                  </div>
                </div>
              </swiper-slide>
            </swiper>
          </ion-toolbar>
        </ion-footer>
      </ion-page>
    </teleport>

  </div>
</template>

<script lang="ts">
  // import Swiper core and required modules
  import SwiperCore, { Virtual } from 'swiper';

  // Import Swiper Vue.js components
  /// <reference path="../types/swiper-vue.d.ts"/>
  import { Swiper, SwiperSlide } from 'swiper/vue';

  SwiperCore.use([Virtual]);

  // Import Swiper styles
  import 'swiper/swiper-bundle.min.css';

  import { defineComponent } from 'vue';

  import { IonIcon, IonPage, IonHeader, IonToolbar, IonButtons, IonButton, IonBackButton, IonContent, IonFooter, IonLabel, IonSpinner, } from '@ionic/vue';
  import { addCircleOutline, trashOutline, chevronForwardOutline } from 'ionicons/icons';

  import { Capacitor } from '@capacitor/core';

  import { Camera, CameraOptions } from '@ionic-native/camera';
  import { File } from '@ionic-native/file';

  import * as pdfMake from 'pdfmake/build/pdfmake';
  import * as pdfFonts from 'pdfmake/build/vfs_fonts';

  import * as pdfjs from 'pdfjs-dist-sig/es5/build/pdf.js';
  // import PdfjsWorker from 'worker-loader!pdfjs-dist-sig/es5/build/pdf.worker.js';
  // const PdfjsWorker = require('worker-loader!pdfjs-dist-sig/es5/build/pdf.worker.js');
  pdfjs.GlobalWorkerOptions.workerSrc = '/assets/pdf.worker.min.js';

  import FormData from 'form-data';

  import { absenceApplicationService } from '../../services/absence-applications';
  import { Account, accountService } from '../../services/accounts';

  import { AxiosResponse } from 'axios';
  import { Content, TDocumentDefinitions } from 'pdfmake/interfaces';
  import { PaginatedResponse } from '../../services/_base';

  import PDFPreview from './PDFPreview.vue';

  export default defineComponent({
    components: {
      IonIcon, IonPage, IonHeader, IonToolbar, IonButtons, IonButton, IonBackButton, IonContent, IonFooter, IonLabel,
      IonSpinner,

      PDFPreview,

      Swiper, SwiperSlide,
    },
    props: {
      label: String,
      modelValue: String,
    },
    data() {
      return {
        account: undefined as Account | undefined,
        state: '',
        activeImageIdx: -1,

        isUploading: false,
        isLoadingPreview: false,
        previewPdf: undefined as any,

        swiper: undefined,
        swiperPreview: undefined,

        showMagnifier: false,
        magnifierPosition: [329.95703125, 6.65234375],
        magnifierSize: 150,
        pointerSize: 10,
        magnifierImageSize: 900,
        sourceWidth: 1,

        addCircleOutline,
        trashOutline,
        chevronForwardOutline,

        torchEnabled: false,

        attachments: [
          // "http://172.20.10.2:8100/img/cv.71b5e1bc.jpg",
          // "http://172.20.10.2:8100/img/receipt.cf8fa128.jpg",
          // "http://172.20.10.2:8100/img/cv.71b5e1bc.jpg",
          // "http://172.20.10.2:8100/img/receipt.cf8fa128.jpg",
          // "http://172.20.10.2:8100/img/cv.71b5e1bc.jpg",
          // "http://172.20.10.2:8100/img/receipt.cf8fa128.jpg",
        ] as Array<string>,

        pdfUrl: undefined as undefined|string,
        points: [] as Array<any>,
      }
    },
    watch: {
      activeImageIdx: async function(newIdx, oldIdx) {
        await this.$nextTick();

        if (newIdx == -1 || oldIdx == -1) return;
        if (this.swiper) (this.swiper as any).slideTo(this.activeImageIdx);
        if (this.swiperPreview) (this.swiperPreview as any).slideTo(this.activeImageIdx);

      },
      pdfUrl(newPdfUrl) {
        this.$emit("update:modelValue", newPdfUrl);
      },
    },
    methods: {
      handleItemClick() {
        if (this.isLoadingPreview) return;

        if (!this.pdfUrl) {
          this.addAttachment();
          return
        }

        this.showPDFPreview();
      },
      imageSwipe(swipeEvent: any) {
        this.activeImageIdx = swipeEvent.activeIndex;
      },
      swiperInit(swiper: any) {
        this.swiper = swiper;
      },
      swiperPreviewInit(swiper: any) {
        this.swiperPreview = swiper;
      },
      addAttachment(): void {
        const options: CameraOptions = {
          quality: 50,
          targetWidth: 1200,
          targetHeight: 2000,
          allowEdit: false,
          destinationType: Camera.DestinationType.FILE_URI,
          encodingType: Camera.EncodingType.JPEG,
          mediaType: Camera.MediaType.PICTURE,
          saveToPhotoAlbum: false,
        }
        Camera.getPicture(options).then((fileUri) => {
          this.attachments.push(fileUri);
          this.activeImageIdx = this.attachments.length - 1;
        });
      },
      removeAttachmentIdx(idx: number) {
        this.attachments.splice(idx, 1);

        if (this.activeImageIdx > this.attachments.length - 1) {
          this.activeImageIdx = this.attachments.length - 1;
        }
      },
      getUrl(filePath: string): string {
        if (filePath.indexOf('http') == 0 || filePath.indexOf('/') == 0 || filePath.indexOf('capacitor') == 0) return filePath;

        return Capacitor.convertFileSrc(filePath);
      },
      async uploadPdf() {
        if (!this.account || !this.account.employee_id) return;

        this.isUploading = true;

        // const attachments: Array<string> = [
        //   "http://localhost:8100/img/cv.71b5e1bc.jpg",
        //   "http://172.20.10.2:8100/img/receipt.cf8fa128.jpg",
        //   "http://172.20.10.2:8100/img/receipt.cf8fa128.jpg",
        //   "http://172.20.10.2:8100/img/receipt.cf8fa128.jpg",
        // ]

        const images: { [key: string]: string } = {};
        const content: Content = [];

        let idx = 0;
        for (const attachment of this.attachments) {
          const fileParts = attachment.split("/");
          images[String(idx)] = await File.readAsDataURL(fileParts.slice(0, -1).join("/"), fileParts[fileParts.length - 1]);
          // images[String(idx)] = attachment;
          content.push({
            image: String(idx),
            fit: [600, 1000],
            pageBreak: idx == 0 ? undefined : 'before',
          })
          idx += 1;
        }

        const dd: TDocumentDefinitions = {
          pageMargins: [0, 0, 0, 0],
          content,
          images,
        };

        (pdfMake as any).vfs = (pdfFonts as any).pdfMake.vfs;
        const pdf = pdfMake.createPdf(dd);

        const s3UploadMeta = (await absenceApplicationService.uploadAttachmentToken(this.account.employee_id)).data;

        const form = new FormData();
        Object.entries(s3UploadMeta.fields).forEach(([field, value]) => {
          form.append(field, value);
        });

        await new Promise((resolve, reject) => {
          pdf.getBlob(blob => {
            form.append("file", blob);
            const request = new XMLHttpRequest();

            request.onreadystatechange = function() {
              if (this.readyState === XMLHttpRequest.DONE && this.status === 204) {
                resolve(this.status);
              }
              if (this.status >= 400) reject(this.status);
            }
            request.open("POST", s3UploadMeta.url);
            request.send(form as any);
          });
        });

        this.pdfUrl = (await absenceApplicationService.signAttachmentUrl(s3UploadMeta.fields.key)).data.presigned_url;
        this.activeImageIdx = -1;
        this.isUploading = false;
      },
      async showPDFPreview() {
        this.isLoadingPreview = true;
        this.previewPdf = await pdfjs.getDocument(this.pdfUrl).promise;
        this.isLoadingPreview = false;
      },
    },
    async mounted() {
      // Load account
      await accountService.list().then((response: AxiosResponse<PaginatedResponse<Account>>) => {
        this.account = response.data.results[0];
      });

      // Initially set pdf url from props
      if (this.modelValue) this.pdfUrl = this.modelValue;

      // console.log(File);
      // this.activeImageIdx = 0;
      // this.isUploading = true;
      // await this.uploadPdf();
      // this.isLoadingPreview = true;
      // await this.showPDFPreview();
    }
  });
</script>
