<template>
  <ion-card class="mx-0 mt-0 shadow">
    <ion-list class="transparent-bg">
      <ion-item class="flex items-center justify-center w-full transparent-bg" lines="none" :detail="showDetail && !isLoadingDetail">
        <ion-label>
          <h2>{{ missingTypes.get(absence.missing_type) }}</h2>
          <p>
            {{ formatDatetime(absence.date_from, "DD.MM.") }} – {{ formatDatetime(absence.date_to, "DD.MM.YYYY") }}
            &middot;
            <zeit-promise-solver :promise="formatDuration(absence.affected_hours * 3600)" /> h pro Tag
          </p>
          <p v-if="showModifiedAt">
            Zuletzt bearbeitet:
            {{ formatDatetime(absence.modified_at, "DD.MM.") }} um {{ formatDatetime(absence.modified_at, "HH:mm") }} Uhr
          </p>
        </ion-label>
        <ion-spinner slot="end" v-if="isLoadingDetail" />
      </ion-item>
    </ion-list>
  </ion-card>
</template>

<script lang="ts">
  import { defineComponent } from 'vue';

  import { formatDatetime, formatDuration } from '../../globals/helpers';

  import ZeitPromiseSolver from '../helpers/ZeitPromiseSolver.vue';

  import {
    IonCard, IonList, IonItem, IonLabel, IonSpinner,
  } from '@ionic/vue';

  import { Absence } from '../../services/absences';

  export default defineComponent({
    components: {
      IonCard, IonList, IonItem, IonLabel, ZeitPromiseSolver, IonSpinner,
    },
    props: {
      absence: Object as () => Absence,
      missingTypes: Object as () => Map<string, string>,
      showModifiedAt: {
        type: Boolean,
        default: false,
      },
      showDetail: {
        type: Boolean,
        default: false,
      },
      isLoadingDetail: {
        type: Boolean,
        default: false,
      }
    },
    data() {
      return {
        formatDatetime,
        formatDuration,
      }
    },
  });
</script>
