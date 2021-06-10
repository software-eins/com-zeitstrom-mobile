<template>
  <zeit-page
    title="Datenschutz"
  >
    <template v-slot:subheader>
      <p class="mb-8">
        Datenschutz und Informationssicherheit sind zentraler Bestandteil der Produkte und Dienstleistungen von
        {{ branding.name }}. Der Schutz deiner Daten und die deiner Mitarbeiter sowie dein Vertrauen sind uns sehr wichtig.
        Daher haben wir technische und organisatorische Maßnahmen zur Gewährleistung der Sicherheit der Verarbeitung
        implementiert, welche wir kontinuierlich weiterentwickeln.
      </p>

      <p class="mb-8">
        Diese Seite soll dir einen Überblick über den rechtlichen Rahmen und die Vertragsbeziehungen zwischen uns
        geben. Sofern du weiterführende Informationen benötigst oder Fragen zu den Inhalten dieser Seite oder den
        aufgeführten Downloads hast, kontaktiere uns gerne über unsere <router-link :to="{name: 'support'}" class="text-primary">Hilfe-Seite</router-link>.
      </p>

      <h3 class="text-xl font-medium mb-6 mt-8 text-black">Auftragsverarbeitungsvertrag (AVV)</h3>

      <p>
        Als Teil unserer Leistungen verarbeiten wir persönliche Daten, welche von dir und deinen Mitarbeitern
        bereitgestellt werden. Ein Auftragsverarbeitungsvertrag (auch AVV, AV-Vertrag oder AV-Vereinbarung genannt)
        regelt, welche Daten davon betroffen sind und wie wir damit umgehen. Dieser Vertrag garantiert dir, dass
        deine Daten von uns nur für die dafür vorgesehenen Zwecke verarbeitet werden.
      </p>

    </template>

    <div class="mt-7 mr-8 max-w-5xl ml-0">

      <div class="flex flex-col lg:flex-row mb-8 shadow sm:rounded-md bg-white px-6 pb-2">
        <div class="max-w-sm w-full flex-none">
          <h3 class="mt-6 mb-6 text-xl font-medium text-gray-900">Vertragsinformationen</h3>

          <zeit-form
            v-if="!isLoadingFormDefault"
            :resource="companyDetails.resource"
            :formFields="companyDetails.fields"
            @update:resource="companyDetails.resource = $event"
            :errors="companyDetails.errors"
            marginLeft=""
            class="mb-4"
            :spacing="[]"
            :cardClasses="[]"
          />

          <div class="w-full flex justify-end pr-8">
            <zeit-button type="flat" color="primary" @click="createDataProcessingAgreement()" :isLoading="companyDetails.isLoading">
              Vertrag erzeugen
            </zeit-button>
          </div>
        </div>
        <div class="flex-grow">

          <h3 v-if="dataProcessingAgreementPreviews.length > 0" class="mt-8 mb-6 text-xl font-medium text-gray-900">Entwurf</h3>
          <div v-if="dataProcessingAgreementPreviews.length > 0" class="bg-gray-100 shadow-sm rounded-md flex-col px-4 py-4 mb-8">
            <div class="flex flex-col items-end">
              <div v-for="dpa in dataProcessingAgreementPreviews" :key="dpa.id">
                <div class="flex items-center mb-4">
                  <div class="flex-grow pr-4">Dieser Vertragsentwurf wurde am {{ formatDatetime(dpa.created_at) }} um {{ formatTime(dpa.created_at) }} erstellt.</div>
                  <div>
                    <zeit-button fill="clear" color="primary" @click="openPreview(dpa)">
                      Vorschau
                    </zeit-button>
                  </div>
                </div>

                <div class="flex-col items-end justify-end">

                  <div class="flex-grow flex items-start cursor-pointer" @click="contractConfirmed = !contractConfirmed">
                    <input type="checkbox" class="mt-1 mr-4 focus:ring-primary h-4 w-4 text-primary-dark border-gray-300 rounded no-pointer-events" v-model="contractConfirmed" />
                    <p class="flex-grow pointer mb-4">
                      Hiermit stimme ich dem Vertrag zur Auftragsverarbeitung zwischen {{ companyDetails.resource.company }}
                      und Software 1 GmbH zu und bestätige, dass ich dazu berechtigt bin, diesen Vertrag rechtsverbindlich
                      im Namen des Unternehmens zu schließen.
                    </p>
                  </div>

                  <div class="flex items-center">
                    <div class="flex-grow"></div>
                    <div class="flex">
                      <zeit-button color="light" fill="clear" @click="deleteContract(dpa)" :isLoading="isSigningLoading" class="mr-4">
                        Entwurf löschen
                      </zeit-button>

                      <zeit-button color="primary" @click="signContract(dpa)" :disabled="!contractConfirmed" :isLoading="isSigningLoading">
                        Vertrag&nbsp;unterzeichnen
                      </zeit-button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <h3 v-if="signedDataProcessingAgreements.length > 0" class="mt-8 mb-6 text-xl font-medium text-gray-900">Aktuelle Dokumente</h3>
          <p v-if="signedDataProcessingAgreements.length > 0" class="mb-8">Es wird nur der jeweils aktuellste Vertrag angezeigt. Ältere Verträge verlieren automatisch ihre Gültigkeit.</p>
          <div v-for="dpa in signedDataProcessingAgreements" :key="dpa.id" class="bg-gray-100 shadow-sm rounded-md flex-col px-4 py-4 bg-light mb-8">
            <div class="flex flex-col items-end">
              <h4 class="font-medium mb-4 w-full">{{ contractTypes[dpa.type] }}</h4>
              <div class="w-full mb-4">Dieser Vertrag wurde am {{ formatDatetime(dpa.signed_at) }} um {{ formatTime(dpa.signed_at) }} unterzeichnet.</div>
              <div class="flex">
                <zeit-button fill="clear" color="light" class="mr-4" @click="openPreview(dpa)">
                  Vorschau
                </zeit-button>
                <zeit-button fill="clear" color="primary" @click="downloadContract(dpa)" :isLoading="isDownloading[dpa.id]">
                  Download
                </zeit-button>
              </div>
            </div>
          </div>

          <h3 class="my-6 text-xl font-medium text-gray-900">Weitere Vertragsbestandteile</h3>

          <div>
            <div class="bg-gray-100 shadow-sm rounded-md flex-col px-4 py-4 bg-light mb-8">
              <div class="flex flex-col items-end">
                <h4 class="font-medium mb-4 w-full">{{ contractTypes['tom'] }}</h4>
                <div class="w-full mb-4">In dieser Anlage erläutern wir unsere Maßnahmen und Prozesse, um deine Daten sicher zu verarbeiten.</div>
                <div class="flex">
                  <zeit-button fill="clear" color="light" class="mr-4" @click="openGuestPreview('tom')">
                    Vorschau
                  </zeit-button>
                  <zeit-button fill="clear" color="primary" @click="downloadGuestContract('tom')" :isLoading="isDownloading['tom']">
                    Download
                  </zeit-button>
                </div>
              </div>
            </div>

            <div class="bg-gray-100 shadow-sm rounded-md flex-col px-4 py-4 bg-light mb-4">
              <div class="flex flex-col items-end">
                <h4 class="font-medium mb-4 w-full">{{ contractTypes['subcontractors'] }}</h4>
                <div class="w-full mb-4">In dieser Anlage listen wir alle externen Dienstleister, die deine Daten in unserem Auftrag verarbeiten.</div>
                <div class="flex">
                  <zeit-button fill="clear" color="light" class="mr-4" @click="openGuestPreview('subcontractors')">
                    Vorschau
                  </zeit-button>
                  <zeit-button fill="clear" color="primary" @click="downloadGuestContract('subcontractors')" :isLoading="isDownloading['subcontractors']">
                    Download
                  </zeit-button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

    </div>
  </zeit-page>
</template>

<style>
ion-toolbar.transparent {
  --background: transparent;
  --ion-color-base: transparent !important;
  --border-style: none;
}
</style>

<script lang="ts">
import download from 'downloadjs';

import { defineComponent, reactive } from 'vue';

import ZeitForm from '../components/ui/ZeitForm.vue';
import ZeitButton from '../components/ui/ZeitButton.vue';
import ZeitPage from '../components/ui/ZeitPage.vue';

import branding from '../branding';

import { institutionService } from '../services/institutions';
import { accountService } from '../services/accounts';
import { Contract, contractService, DataProcessingAgreement } from '../services/contracts';

import { FormField } from '../services/_base';

import { formatDatetime, formatTime } from '../globals/helpers';


export default defineComponent({
    title: "Datenschutz",
    components: {
        ZeitForm, ZeitButton, ZeitPage,
    },
    inject: [
        "isMobile",
    ],
    computed: {
      title() { return "Datenschutz"; }
    },
    data() {
      return {
        branding,

        formatDatetime,
        formatTime,

        institutionService,
        accountService,
        contractService,

        companyDetails: {
            resource: {} as DataProcessingAgreement,
            fields: [
                new FormField('representative', 'Vertretungsberechtigter', {autofocus: true}),
                new FormField('company', 'Firmenname'),
                new FormField('street', 'Adresse'),
                new FormField('postal_code', 'Postleitzahl'),
                new FormField('city', 'Stadt'),
                new FormField('country', 'Land'),
            ],
            errors: {},
            isLoading: false,
        },

        isSigningLoading: false,
        isLoadingFormDefault: true,

        contractStates: {} as any,
        contractTypes: {} as any,

        isDownloading: reactive({}) as any,

        dataProcessingAgreementPreviews: [] as Array<Contract>,
        signedDataProcessingAgreements: [] as Array<Contract>,

        previewHTML: '',

        contractConfirmed: false,
      }
    },
    methods: {
      loadContractStates() {
        return this.contractService.contractStates(1, 500).then(response => {
          const statesById = {} as any;
          for (const state of response.data.results) {
            statesById[state.id] = state.label;
          }
          this.contractStates = statesById;
        });
      },
      loadContractTypes() {
        return this.contractService.contractTypes(1, 500).then(response => {
          const typesById = {} as any;
          for (const t of response.data.results) {
            typesById[t.id] = t.label;
          }
          this.contractTypes = typesById;
        });
      },
      openGuestPreview(contractType: string) {
        const url =
          process.env.VUE_APP_BASE_URL +
          this.contractService.endpoint +
          "guest-document/?type=" + contractType +
          '&oauth2-bearer=' + localStorage.accessToken;

        window.open(url);
      },
      openPreview(contract: Contract) {
        const url =
          process.env.VUE_APP_BASE_URL +
          this.contractService.endpoint +
          contract.id + "/preview/" +
          '?oauth2-bearer=' + localStorage.accessToken;

        window.open(url);
      },
      downloadGuestContract(contractType: string) {
        this.isDownloading[contractType] = true;

        const downloadUrl =
            process.env.VUE_APP_BASE_URL +
            this.contractService.endpoint +
            "guest-document-pdf/?type=" + contractType +
            '&oauth2-bearer=' + localStorage.accessToken;

        const filename = this.contractTypes[contractType] + ".pdf";

        const x = new XMLHttpRequest();
        x.open( "GET", downloadUrl , true);
        x.setRequestHeader("Authorization", "Bearer " + localStorage.accessToken);
        x.responseType = "blob";
        x.onload = (e: any) => {
            download(e.target.response, filename, "application/pdf");
            this.isDownloading[contractType] = false;
        };
        x.send();
      },
      downloadContract(contract: Contract) {
        this.isDownloading[contract.id] = true;
        const downloadUrl =
            process.env.VUE_APP_BASE_URL +
            this.contractService.endpoint +
            contract.id + "/pdf/"

        const date = contract.signed_at || contract.created_at;

        const filename =
            date.slice(0,16).replace('T', '_').replace(':', '-') + "_" +
            this.contractTypes[contract.type] + ".pdf";

        const x = new XMLHttpRequest();
        x.open( "GET", downloadUrl , true);
        x.setRequestHeader("Authorization", "Bearer " + localStorage.accessToken);
        x.responseType = "blob";
        x.onload = (e: any) => {
            download(e.target.response, filename, "application/pdf");
            this.isDownloading[contract.id] = false;
        };
        x.send();
      },
      createDataProcessingAgreement() {
          this.companyDetails.isLoading = true;
          this.contractService.createDataProcessingAgreement(this.companyDetails.resource).then(() => {
              this.updateDataProcessingAgreementPreviews();
              this.companyDetails.isLoading = false;
          }).catch((error: any) => {
              this.companyDetails.isLoading = false;

              // Deal with form validation errors
              if (error.response.status == 400) {
                this.companyDetails.errors = error.response.data;
              }
          });
      },
      updateDataProcessingAgreementPreviews() {
        return this.contractService.listParams({page: 1, pagesize: 100, types: ['dpa'], states: ['preview']}).then(response => {
          this.dataProcessingAgreementPreviews = response.data.results;
        });
      },
      updateSignedDataProcessingAgreements() {
        return this.contractService.listParams({page: 1, pagesize: 1, types: ['dpa'], states: ['signed']}).then(response => {
          this.signedDataProcessingAgreements = response.data.results;
        });
      },
      signContract(contract: Contract) {
        this.isSigningLoading = true;

        return this.contractService.sign(contract.id).then(() => {
          return Promise.all([
            this.updateDataProcessingAgreementPreviews(),
            this.updateSignedDataProcessingAgreements(),
          ]).then(() => {
            this.isSigningLoading = false;
            this.contractConfirmed = false;
          });
        });
      },
      deleteContract(contract: Contract) {
        this.isSigningLoading = true;

        return this.contractService.delete(contract.id).then(() => {
          return this.updateDataProcessingAgreementPreviews().then(() => {
            this.isSigningLoading = false;
            this.contractConfirmed = false;
          })
        });
      },
    },
    mounted() {
      Promise.all([
        this.institutionService.list().then(response => {
          const i = response.data.results[0];
          let street = i.address + " " + i.number;
          if (i.address_2) street = street + ", " + i.address_2;

          this.companyDetails.resource = {
            company: i.name,
            street: street,
            postal_code: i.zip_code,
            city: i.city,
            country: i.country || "Deutschland",
            ...this.companyDetails.resource,
          };
        }),
        this.accountService.list().then(response => {
          this.companyDetails.resource = {
            representative: response.data.results[0].full_name,
            ...this.companyDetails.resource,
          };
        }),
      ]).then(() => {
        this.isLoadingFormDefault = false;
      });

      this.loadContractStates();
      this.loadContractTypes();
      this.updateDataProcessingAgreementPreviews();
      this.updateSignedDataProcessingAgreements();
    },
});
</script>
