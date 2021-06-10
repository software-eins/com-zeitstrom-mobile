<template>
  <zeit-page
    title="Unternehmen"
    :has-refresher="true"
    @refresh="loadData($event)"
  >
    <template v-slot:subheader>
      Folgende Daten sind zu deinem Unternehmen gespeichert.
    </template>

    <template v-slot:mobileButtons>
      <ion-button
          color="primary"
          :strong="true"
          :disabled="!hasChanges() || institutionForm.isSaving"
          @click="updateInstitution()"
      >Speichern</ion-button>
    </template>

    <div class="max-w-md" v-if="isLoaded">
      <zeit-card v-if="account.permissions.indexOf('institutions:edit') == -1">
        <zeit-simple-item label="Firmenname" :value="institution.name" />
        <zeit-simple-item v-if="institution.contact_person" label="Ansprechpartner" :value="institution.contact_person" />
        <zeit-simple-item label="Anschrift" :value="institution.address + ' ' + institution.number" />
        <zeit-simple-item v-if="institution.address_2" label="Adresszusatz" :value="institution.address_2" />
        <zeit-simple-item label="Stadt" :value="institution.zip_code + ' ' + institution.city" />
        <zeit-simple-item lines="full" label="Land" :value="institution.country || 'Deutschland'" />
      </zeit-card>

      <template v-else>
        <zeit-form
          :resource="institutionForm.resource"
          :service="institutionForm.service"
          :formFields="institutionForm.fields"
          :errors="institutionForm.errors"
          :disabled="institutionForm.isSaving"
          @update:resource="institutionForm.resource = $event"
          marginLeft=""
          marginRight=""
          lastLine="full"
        />
        <div class="w-full text-right mt-4 mb-6 mr-6"  v-if="!isMobile">
          <zeit-button
            :disabled="!hasChanges()"
            @click="updateInstitution()"
            :isLoading="institutionForm.isSaving"
          >Speichern</zeit-button>
        </div>
      </template>
    </div>

    <ion-item v-else lines="none" class="transparent-bg">
      <div class="w-full flex items-center justify-center mt-8"><ion-spinner /></div>
    </ion-item>

  </zeit-page>
</template>

<script lang="ts">
  import { defineComponent } from 'vue';
  import {
    IonSpinner, IonItem, IonButton,
    toastController,
  } from '@ionic/vue';

  import { accountService, Account } from '../services/accounts';
  import { institutionService, Institution } from '../services/institutions';

  import ZeitSimpleItem from '../components/ui/ZeitSimpleItem.vue';
  import ZeitPage from '../components/ui/ZeitPage.vue';
  import ZeitCard from '../components/ui/ZeitCard.vue';
  import ZeitForm from '../components/ui/ZeitForm.vue';
  import ZeitButton from '../components/ui/ZeitButton.vue';

  import { FormField } from '../services/_base';


  export default defineComponent({
    components: {
        IonSpinner, IonItem, IonButton,

        ZeitSimpleItem, ZeitPage, ZeitCard, ZeitForm, ZeitButton,
    },
    data() {
      return {
        isLoaded: false,
        institutionService,
        accountService,

        account: undefined as Account|undefined,
        institution: undefined as Institution|undefined,

        institutionForm: {
          resource: {} as Institution,
          service: institutionService,
          fields: [
            new FormField('name', 'Firmenname', { mobileType: 'stacked', }),
            new FormField('contact_person', 'Ansprechpartner', { mobileType: 'stacked', }),
            new FormField('address', 'Straße'),
            new FormField('number', 'Hausnummer'),
            new FormField('address_2', 'Adresszusatz'),
            new FormField('zip_code', 'Postleitzahl'),
            new FormField('city', 'Stadt'),
          ],
          errors: {},
          isSaving: false,
        },
      }
    },
    watch: {
      institution: function(newInstitution) {
        this.institutionForm.resource = JSON.parse(JSON.stringify(newInstitution));
      },
    },
    inject: [
      "isMobile",
    ],
    methods: {
      hasChanges() {
        return JSON.stringify(this.institution) != JSON.stringify(this.institutionForm.resource);
      },

      async updateInstitution() {
        this.institutionForm.isSaving = true;
        this.institutionForm.errors = {};

        const institution = this.institutionForm.resource;
        let remoteInstitution: Institution;
        try {
          remoteInstitution = (await this.institutionService.update(institution.id, institution)).data;
          toastController
            .create({
              message: 'Deine Unternehmensangaben wurden aktualisiert',
              duration: 2000
            }).then(toast => toast.present());
        } catch(e) {
          if (e.response.status == 400) {
            this.institutionForm.errors = e.response.data;
            this.institutionForm.isSaving = false;
            return;
          }
          throw e;
        }

        this.institution = {
          ...this.institution,
          ...remoteInstitution,
        };

        this.institutionForm.isSaving = false;
      },

      async loadData(event?: any) {
        if (event) this.institutionService.clearCache();

        const [accountResponse, institutionResponse] = await Promise.all([
          this.accountService.list(),
          this.institutionService.list(),
        ]);

        this.account = accountResponse.data.results[0];
        this.institution = institutionResponse.data.results[0];

        // Stop refresher
        if (event && event.target && event.target.complete) event.target.complete();

        this.isLoaded = true;
      },
    },
    beforeMount() {
      this.loadData();
    },
  });
</script>
