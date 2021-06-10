<template>
  <div class="flex flex-col items-center">
    <img class="absolute pointer-events-none opacity-0" src="../../_testdata/cv.jpg" />

    <teleport to="#scan-overlay" v-if="activeImage && state == 'select-contour'">
      <ion-page>
        <ion-header ref="header">
          <ion-toolbar>
            <ion-buttons slot="start">
              <ion-back-button default-href="/" text="Zurück" @click="dismiss()"></ion-back-button>
            </ion-buttons>
            <ion-buttons slot="end">
              <ion-button color="primary" @click="applySelection()">Weiter</ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>

        <ion-content>
          <div class="flex w-full h-full justify-center items-center" slot="fixed">
            <div v-if="showMagnifier" class="fixed shadow" style="
              top: 10%;
              z-index: 20;
              border-radius: 50%;
              overflow: hidden;
              border: 2px solid white;
              background: black;
            "
            :style="{
              width: magnifierSize + 'px',
              height: magnifierSize + 'px',
              left: isTouchTopLeft() ? '60%' : '20px',
            }">
              <div class="w-full h-full relative">
                <div
                  class="absolute z-20 rounded-full border-primary border-2"
                  :style="{
                    width: pointerSize + 'px',
                    height: pointerSize + 'px',
                    top: (magnifierSize / 2 - pointerSize / 2) + 'px',
                    left: (magnifierSize / 2 - pointerSize / 2) + 'px',
                  }"
                ></div>
                <img
                  class="absolute max-w-none"
                  :src='getUrl(activeImage)'
                  :style="{
                    width: magnifierImageSize + 'px',
                    left: (-magnifierPosition[0] * magnifierImageSize / sourceWidth + magnifierSize / 2) + 'px',
                    top: (-magnifierPosition[1] * magnifierImageSize / sourceWidth + magnifierSize / 2) + 'px'
                  }"
                />
              </div>
            </div>
            <img class="absolute opacity-100 pointer-events-none" id="imageSrc" :src='getUrl(activeImage)' :onload="cvPlayground" />
            <img class="fixed max-w-none opacity-0 pointer-events-none" id="imageSrcRaw" :src='getUrl(activeImage)' />
            <canvas
              id="myPlaygroundCanvas"
              style="background: transparent; z-index: 10; max-width: 100%;"
              @touchstart="selectPoint($event)"
              @touchmove="dragCircle($event)"
              @touchend="deselectPoints()"
            ></canvas>
          </div>
        </ion-content>
      </ion-page>
    </teleport>

    <teleport to="#scan-overlay" v-if="state == 'review-selection'">
      <ion-page>
        <ion-header ref="header">
          <ion-toolbar>
            <ion-buttons slot="start">
              <ion-back-button default-href="/" text="Zurück" @click="state = 'select-contour'"></ion-back-button>
            </ion-buttons>
            <ion-buttons slot="end">
              <ion-button color="primary" @click="confirmSelection()">Fertig</ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>

        <ion-content>
          <div class="flex w-full h-full justify-center items-center" slot="fixed">
            <canvas
              id="reviewCanvas"
              style="background: transparent; z-index: 10; max-width: 100%;"
            ></canvas>
          </div>
        </ion-content>
      </ion-page>
    </teleport>

    <img v-for="path, idx of attachments" :key="idx" :src="getUrl(path)"  class="w-1/5 m-2" />

    Atts: {{ attachments }}

    <ion-icon :ios="addCircleOutline" :md="addCircleOutline" class="w-6 h-6 text-gray-400 mx-2" @click="addAttachment()" />
  </div>
</template>

<script lang="ts">
  import { defineComponent } from 'vue';
  // import { DocumentScanner, DocumentScannerOptions } from '@ionic-native/document-scanner';
  import { FormField } from '../../services/_base';

  import { IonIcon, IonPage, IonHeader, IonToolbar, IonButtons, IonBackButton, IonButton, IonContent } from '@ionic/vue';
  import { addCircleOutline, flashOutline, flashOffOutline } from 'ionicons/icons';

  import { Capacitor } from '@capacitor/core';

  import { File, FileEntry } from '@ionic-native/file';

  import { Camera, CameraOptions } from '@ionic-native/camera';

  import branding from '../../branding';

  // import * as _cv from '../../plugins/opencv.js';
  // const cv = _cv as any;


  export default defineComponent({
    components: {
      IonIcon, IonPage, IonHeader, IonToolbar, IonButtons, IonBackButton, IonButton, IonContent
    },
    data() {
      return {
        state: '',
        activeImage: undefined as string|undefined,

        showMagnifier: false,
        magnifierPosition: [329.95703125, 6.65234375],
        magnifierSize: 150,
        pointerSize: 10,
        magnifierImageSize: 900,
        sourceWidth: 1,

        addCircleOutline,

        torchEnabled: false,

        attachments: [] as Array<string>,

        points: [] as Array<any>,
      }
    },
    methods: {
      isTouchTopLeft() {
        const image: any = document.getElementById("imageSrc");

        return (
          image &&
          this.magnifierPosition[0] < image.width / 2 &&
          this.magnifierPosition[1] < image.height / 2
        )
      },
      dismiss() {
        this.activeImage = undefined;
        this.state = '';
        // TODO: Delete image
      },
      addAttachment(): void {
        // this.activeImage = "/img/cv.71b5e1bc.jpg";
        // this.state = 'select-contour';

        // this.activeImage = 'file:///var/mobile/Containers/Data/Application/C07FCE60-45AA-4362-9558-550811C8E6CA/tmp/cdv_photo_1622824366.jpg';
        // this.state = 'select-contour';

        const options: CameraOptions = {
          quality: 100,
          destinationType: Camera.DestinationType.FILE_URI,
          encodingType: Camera.EncodingType.JPEG,
          mediaType: Camera.MediaType.PICTURE,
        }
        Camera.getPicture(options).then((fileUri) => {
          this.activeImage = fileUri;
          console.log(fileUri);
          this.state = 'select-contour';
        });
      },
      getUrl(filePath: string): string {
        if (filePath.indexOf('http') == 0 || filePath.indexOf('/') == 0) return filePath;

        return Capacitor.convertFileSrc(filePath);
      },
      async cvPlayground(): Promise<void> {
        const canvas: any = document.getElementById("myPlaygroundCanvas");
        const image: any = document.getElementById("imageSrc");

        console.log("trying to load image", this.activeImage);

        if (!this.activeImage) return;

        console.log("url", Capacitor.convertFileSrc(this.activeImage));

        // imageFileEntry.file(function(file) {
        //   const reader = new FileReader();
        //   reader.onloadend = function() {
        //     console.log("opened", this.result);
        //   }

        //   reader.readAsText(file);
        // });

        // console.log(imageFileEntry);

        // console.log(imageFile.nativeURL);

        // imageFile.

        // cv.imread(imageFile.nativeURL);

        // const cvImage = cv.imread(imageFile);


        // TODO...
        // const cvImage = cv.imread(image);
        // console.log("...loaded");

        // const edges = new cv.Mat();

        // cv.Canny(cvImage, edges, 100, 200);

        // const contours = new cv.MatVector();
        // const hierarchy = new cv.Mat();

        // cv.findContours(edges, contours, hierarchy, cv.RETR_LIST, cv.CHAIN_APPROX_SIMPLE);

        // const cnts = []
        // for(let i=0; i < contours.size(); i++){
        //   const tmp = contours.get(i);
        //   const peri = cv.arcLength(tmp,true);
        //   const approx = new cv.Mat();
        //   const result = {
        //       area: cv.contourArea(tmp),
        //       points: [] as Array<any>,
        //   };

        //   cv.approxPolyDP(tmp,approx,0.02*peri,true);
        //   const pointsData = approx.data32S;
        //   for(let j=0;j<pointsData.length/2;j++) result.points.push({
        //     x: pointsData[2*j],
        //     y:pointsData[2*j+1]
        //   });

        //   if(result.points.length===4) cnts.push(result);
        // }
        // cnts.sort((a,b)=>b.area-a.area);

        // if (cnts[0].area < 10000) {
        //   this.points = [{x: 10, y: 10}, {x: cvImage.cols - 10, y: 10}, {x: cvImage.cols - 10, y: cvImage.rows - 10}, {x: 10, y: cvImage.rows - 10}];
        // } else {
        //   this.points = cnts[0].points;
        // }

        // // Draw contours
        // // cv.imshow(canvas, edges)

        // // Draw points
        // this.drawPoints();
      },
      drawPoints() {
        const canvas: any = document.getElementById("myPlaygroundCanvas");
        const image: any = document.getElementById("imageSrc");

        if (!canvas) return;

        const context = (canvas as any).getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);

        canvas.width = image.width;
        canvas.height = image.height;

        // context.drawImage(new cv.Mat(), 0, 0, image.width, image.height);

        for(let i=0; i < this.points.length; i++) {
          const circle = this.points[i];

          // context.globalAlpha = 0.85;
          context.beginPath();
          context.arc(circle.x, circle.y, 5, 0, Math.PI*2);
          context.fillStyle = branding.colors.primary;
          context.strokeStyle = branding.colors.primary;
          context.lineWidth = 2;
          context.fill();
          context.stroke();
          context.beginPath();
          context.moveTo(circle.x, circle.y);
          context.lineTo( this.points[i-1>=0?i-1:3].x,  this.points[i-1>=0?i-1:3].y);
          context.stroke();
        }
      },
      getScale() {
        const canvas: any = document.getElementById("myPlaygroundCanvas");
        const image: any = document.getElementById("imageSrc");
        return image.naturalWidth / canvas.width;
      },
      getTouchCoordinates(e: TouchEvent) {
        const x = e.touches[0].pageX - (e.target as any).offsetLeft;
        const y = e.touches[0].pageY - (e.target as any).offsetTop - (this.$refs.header as any).$el.offsetHeight;

        console.log([x, y]);

        return [x, y];
      },
      selectPoint(e: TouchEvent) {
        const [x, y] = this.getTouchCoordinates(e);

        this.showMagnifier = true;
        this.magnifierPosition = [x, y];

        let minDistance = 500;
        let minPoint = undefined;

        for(let i=0; i < this.points.length; i++) {
          const d = Math.pow(this.points[i].x - x , 2) + Math.pow(this.points[i].y - y , 2);
          this.points[i].selected = false;

          if (d < minDistance) {
            minDistance = d;
            minPoint = this.points[i];
          }
        }
        if (minPoint) minPoint.selected = true;

        this.drawPoints();
      },
      deselectPoints() {
        this.showMagnifier = false;
        for(let i=0; i < this.points.length; i++) {
          this.points[i].selected = false;
        }
        this.drawPoints();
      },
      dragCircle(e: TouchEvent) {
        const image: any = document.getElementById("imageSrc");
        const [x, y] = this.getTouchCoordinates(e);

        this.magnifierPosition = [x, y];
        this.sourceWidth = image.width;

        for(let i=0; i < this.points.length; i++) {
          if(!this.points[i].selected) continue;

          this.points[i].x = x;
          this.points[i].y = y;
        }
        this.drawPoints();
      },
      getOrderedPoints() {
        const points = this.points;

        const topPoints = points.slice(0, 2).sort((a, b) => a.x - b.x);
        const bottomPoints = points.slice(2, 4).sort((a, b) => a.x - b.x);

        return [topPoints[0], topPoints[1], bottomPoints[1], bottomPoints[0]];
      },
      async applySelection() {
        const canvas: any = document.getElementById("myPlaygroundCanvas");
        const image: any = document.getElementById("imageSrcRaw");
        const cvImage = cv.imread(image);

        const scale = image.width / canvas.width;

        let points = this.getOrderedPoints();
        const newPoints = [];

        for (const point of points) newPoints.push({
          x: point.x * scale,
          y: point.y * scale,
        });

        points = newPoints;

        const [tl, tr, br, bl] = points;

        const width = Math.max(
          Math.sqrt((br.x-bl.x)**2 + (br.y-bl.y)**2),
          Math.sqrt((tr.x-tl.x)**2 + (tr.y-tl.y)**2),
        );

        const height = Math.max(
          Math.sqrt((tr.x-br.x)**2 + (tr.y-br.y)**2),
          Math.sqrt((tl.x-bl.x)**2 + (tl.y-bl.y)**2),
        );

        const from = cv.matFromArray(4,1,cv.CV_32FC2,[points[0].x,points[0].y,points[1].x,points[1].y,points[2].x,points[2].y,points[3].x,points[3].y]);
        const to = cv.matFromArray(4,1,cv.CV_32FC2,[0,0,width-1,0,width-1,height-1,0,height-1]);
        const M = cv.getPerspectiveTransform(from, to);
        const out = new cv.Mat();
        const size = new cv.Size();
        size.width = width;
        size.height = height;
        cv.warpPerspective(cvImage, out, M, size);

        this.state = 'review-selection';

        await this.$nextTick();

        const reviewCanvas: any = document.getElementById("reviewCanvas");
        cv.imshow(reviewCanvas, out);
      },
      confirmSelection() {
        console.log("confirm");

      },
    },
    mounted() {
      // const i = cv.call("imread", document.getElementById("imageSrc"));
      // // const i = cv.imread();
      // console.log(i);
      this.addAttachment();
    }
  });
</script>
