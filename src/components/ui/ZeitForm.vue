<template>
  <div>
    <template v-if="isMobile">
      <ion-item v-if="mobileLineTop" lines="full" class="transparent-bg h-0" />
      <ion-item v-for="(field, idx) of getFields()" :key="idx" :lines="idx + 1 == getFields().length ? lastLine : undefined" class="flex flex-col">
        <ion-label position="stacked" class="w-full" color="danger" v-if="errors && errors[field.name]">{{ errors[field.name][0] }}</ion-label>

        <div class="w-full flex items-center" v-if="field.mobileType == 'text'">
          <ion-label>{{ field.label }}</ion-label>
          <ion-input
            v-if="!field.isReadOnly && !disabled"
            :type="field.inputType"
            slot="end"
            class="text-right"
            v-model="localResource[field.name]"
          />
          <ion-input v-else-if="(field.isReadOnly || disabled) && !field.renderer" disabled :type="field.inputType" slot="end" class="text-right" :value="localResource[field.name]" />
          <div v-else slot="end" class="text-right flex-grow">
              <zeit-promise-solver :promise="field.renderer(localResource)" :key="localResource[field.name]" />
          </div>
        </div>
        <div v-else-if="field.mobileType == 'stacked'" class="w-full">
          <ion-label position="stacked">{{ field.label }}</ion-label>
          <ion-input
            :type="field.inputType"
            :disabled="field.isReadOnly || disabled"
            v-model="localResource[field.name]"
          />
        </div>
        <template v-else-if="field.mobileType == 'select'">
          <ion-label position="stacked">{{ field.label }}</ion-label>
          <ion-spinner v-if="!choicesByField[field.name]" />
          <ion-select
            v-if="choicesByField[field.name]"
            :disabled="field.isReadOnly || disabled"
            :interface-options="{ header: field.label }"
            interface="action-sheet"
            placeholder="Foo"
            cancel-text="Abbrechen"
            v-model="localResource[field.name]"
          >
            <ion-select-option
              v-for="choice of choicesByField[field.name]"
              :key="choice.id"
              :value="choice.id"
            >
              {{ choice.$display }}
            </ion-select-option>
          </ion-select>
        </template>
        <div class="w-full flex items-center" v-else-if="field.mobileType == 'bool'">
          <ion-label class="flex-grow">{{ field.label }}</ion-label>
          <ion-toggle
            class="flex-none"
            :disabled="field.isReadOnly || disabled"
            v-model="localResource[field.name]"
          />
        </div>
        <template v-else-if="field.mobileType == 'color'">
          <ion-label position="stacked">{{ field.label }}</ion-label>
          <div class="flex flex-wrap pb-1">
              <div
                  v-for="color of colors"
                  :key="color.code"
                  class="color-box rounded my-2 mr-4"
                  :class="{active: localResource[field.name] == color.code}"
                  :style="getColorStyle(color)"
                  @click="updateLocalResource(field, color.code)"></div>
          </div>
        </template>
        <template v-else-if="field.mobileType == 'time'">
          <ion-label>{{ field.label }}</ion-label>
          <div slot="end" class="flex flex-row items-center">
            <ion-datetime
              :disabled="field.isReadOnly || disabled"
              display-format="HH:mm:ss"
              picker-format="HH:mm"
              placeholder="Uhrzeit wählen"
              cancelText="Abbrechen"
              doneText="Fertig"
              class="text-right"
              :value="localResource[field.name]"
              @ion-change="removeSecondsFromTime($event, field.name)"
            />
            <span v-if="localResource[field.name]" :class="{'opacity-30': disabled}">Uhr</span>
          </div>
        </template>
        <div v-else-if="field.mobileType == 'date'" class="flex items-center w-full">
          <div class="flex-grow"><ion-label>{{ field.label }}</ion-label></div>
          <div slot="end" class="flex flex-row items-center">
            <ion-datetime
              :disabled="field.isReadOnly || disabled"
              display-format="DD.MM.YYYY"
              picker-format="DD.MM.YYYY"
              placeholder="Datum wählen"
              cancelText="Abbrechen"
              doneText="Fertig"
              class="text-right"
              :value="localResource[field.name]"
              @ion-change="removeTimeFromDatetime($event, field.name)"
            />
          </div>
        </div>
        <template v-else-if="field.mobileType == 'documentScan'">
          <PDFScanner
            :label="field.label"
            v-model="localResource[field.name]"
          />
        </template>
        <template v-else>
          {{ field.mobileType }}
        </template>
      </ion-item>
    </template>
    <div v-else :class="[maxWidth, marginLeft, marginRight]">
      <div :class="cardClasses">
        <div class="space-y-6 flex flex-col" :class="spacing">
          <div class="w-full" v-for="(field, idx) of getFields()" :key="idx">

            <zeit-form-desktop-label :field="field" :errors="errors" v-if="field.type != 'bool'" />

            <template v-if="field.type == 'text'">
              <input
                v-if="!field.isReadOnly && !disabled"
                :type="field.inputType" autocomplete="off"
                :name="field.name" :id="field.name"
                v-model="localResource[field.name]"
                class="focus:ring-primary focus:border-primary flex-grow block w-full min-w-0 rounded-none rounded-md sm:text-sm mt-1"
                :class="errors && errors[field.name] ? 'border-red-500' : 'border-gray-300'"
              />
              <input
                v-else-if="(field.isReadOnly || disabled) && !field.renderer"
                disabled
                :value="localResource[field.name]"
                :type="field.inputType" autocomplete="off"
                class="focus:ring-primary focus:border-primary flex-grow block w-full min-w-0 rounded-none rounded-md sm:text-sm border-gray-300 mt-1 bg-gray-100"
              />
              <div v-else>
                <zeit-promise-solver :promise="field.renderer(localResource)" :key="localResource[field.name]" />
              </div>
            </template>

            <template v-else-if="field.type == 'textarea'">
              <textarea
                v-if="!field.isReadOnly && !disabled"
                autocomplete="off"
                :name="field.name" :id="field.name"
                v-model="localResource[field.name]"
                class="focus:ring-primary focus:border-primary flex-grow block w-full min-w-0 rounded-none rounded-md sm:text-sm mt-1"
                :class="errors && errors[field.name] ? 'border-red-500' : 'border-gray-300'"
                style="min-height: 8rem;"
              />
              <textarea
                v-else-if="(field.isReadOnly || disabled) && !field.renderer"
                disabled
                :value="localResource[field.name]"
                autocomplete="off"
                class="focus:ring-primary focus:border-primary flex-grow block w-full min-w-0 rounded-none rounded-md sm:text-sm border-gray-300 mt-1 bg-gray-100"
                style="min-height: 8rem;"
              />
              <div v-else>
                <zeit-promise-solver :promise="field.renderer(localResource)" :key="localResource[field.name]" />
              </div>
            </template>

            <template v-else-if="field.type == 'select'">
              <zeit-simple-select
                :choices="choicesByField[field.name]"
                :selected-id="localResource[field.name]"
                :disabled="field.isReadOnly || disabled"
                @update="localResource[field.name] = $event || null"
              />
            </template>

            <div v-else-if="field.type == 'bool'" class="flex">
              <zeit-form-desktop-label :field="field" :errors="errors" class="flex-grow mr-2" />
              <div class="flex-none">
                <zeit-toggle
                  :disabled="field.isReadOnly || disabled"
                  v-model="localResource[field.name]"
                />
              </div>
            </div>

            <template v-else-if="field.type == 'color'">
              <div class="flex flex-wrap pb-1">
                  <div
                      v-for="color of colors"
                      :key="color.code"
                      class="color-box cursor-pointer rounded my-2 mr-4 ring-2 ring-offset ring-transparent ring-2 ring-offset"
                      :class="{'ring-primary': localResource[field.name] == color.code}"
                      :style="getColorStyle(color)"
                      @click="updateLocalResource(field, color.code)"></div>
              </div>
            </template>

            <template v-else>
              {{ field.label }}: {{ field.type }}
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
    .color-box {
        width: 53px;
        height: 25px;
    }
    ion-item {
        overflow: initial !important;
    }
</style>

<script>
import { IonItem, IonInput, IonLabel, IonSelect, IonToggle, IonSelectOption, IonSpinner, IonDatetime } from '@ionic/vue';


import { defineComponent } from 'vue';
import { colors } from '@/globals/colors.ts';
import ZeitPromiseSolver from '../helpers/ZeitPromiseSolver.vue';

import ZeitToggle from './ZeitToggle.vue';
import ZeitSimpleSelect from './ZeitSimpleSelect.vue';
import ZeitFormDesktopLabel from './ZeitFormDesktopLabel.vue';

import PDFScanner from './PDFScanner.vue';

export default defineComponent({
  components: {
    IonItem, IonInput, IonLabel, IonSelect, IonToggle, IonSelectOption, IonSpinner, ZeitPromiseSolver, IonDatetime,
    ZeitToggle, ZeitSimpleSelect, ZeitFormDesktopLabel,

    PDFScanner,
  },
  inject: [
    "isMobile",
  ],
  props: {
    resource: Object,
    service: Object,
    formFields: Object,
    errors: Object,
    disabled: {
      type: Boolean,
      default: false,
    },
    lastLine: String,
    maxWidth: {
      type: String,
      default: 'max-w-lg',
    },
    marginLeft: {
      type: String,
      default: 'ml-4',
    },
    marginRight: {
      type: String,
      default: 'mr-8',
    },
    spacing: {
      type: Array,
      default: () => ["py-6", "px-4", "sm:p-6"],
    },
    cardClasses: {
      type: Array,
      default: () => ["shadow", "sm:rounded-md", "bg-white"],
    },
    mobileLineTop: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      colors,
      localResource: {},
      mode: 'create',
      choicesByField: {},
    }
  },
  methods: {
    getFields(excludeHiddenFields=true) {
      return (this.formFields || this.service.formFields).filter(field => {
        if (excludeHiddenFields && field.type == 'hidden') return false;

        const fieldVisibility = (
          this.mode == "edit" && field.showEdit ||
          this.mode == "create" && field.showCreate
        );
        if (!fieldVisibility) return false;

        if (!field.showField(this.resource)) return false;

        return true;
      });
    },
    getColorStyle(color) {
        return {
            background: '#' + color.code,
        }
    },
    updateLocalResource(field, value) {
        if (this.disabled || field.isReadOnly) return;
        this.localResource[field.name] = value;
    },
    copyRemoteResource() {
        // Copy prop resource and set mode to `create` or `edit`
        if (!this.resource) return
        this.localResource = JSON.parse(JSON.stringify(this.resource));

        if (this.resource.id) {
          this.mode = "edit";
        } else {
          this.mode = "create";
        }
    },
    setDefaults() {
      for (const field of this.getFields(false)) {
        if (this.localResource[field.name]) continue;

        if (typeof(field.default) == 'string') this.localResource[field.name] = field.default;

        if (typeof(field.default) == 'function') field.default(this.localResource);
      }
    },
    removeTimeFromDatetime(event, fieldName) {
      const newTime = event.detail.value;
      event.detail.value = newTime.slice(0, 10);
      this.localResource[fieldName] = newTime.slice(0, 10);
    },
    removeSecondsFromTime(event, fieldName) {
      const newTime = event.detail.value;
      event.detail.value = newTime.slice(0, 17) + '00.000' + newTime.slice(23);
      this.localResource[fieldName] = newTime.slice(0, 17) + '00.000' + newTime.slice(23);
    },

  },

  watch: {
    localResource: {
        deep: true,
        handler(newResource) {
          this.$emit('update:resource', newResource);
          console.log("updated", newResource);
        },
    },
  },

  mounted() {
    this.copyRemoteResource();
    this.setDefaults();

    // Load choices for select fields
    for (const field of this.getFields()) {
      if (field.type != 'select') continue;

      const choiceFunc = field.remoteSourceService[field.remoteSourceListMethod];
      choiceFunc.call(field.remoteSourceService).then(response => {

        // Add null value if allowed
        const nullValues = [];
        if (field.allowNull) nullValues.push({id: undefined, $display: "Keine Auswahl"});


        // Validate if the current value is within the results,
        // otherwise load it, and add it as the first option
        let choices = [];

        const appendCurrentEntry = (
          this.localResource[field.name] &&
          response.data.results.map(choice => choice.id).indexOf(this.localResource[field.name]) == -1
        );
        if (appendCurrentEntry) {
          if (field.remoteSourceAttribute == "id") {
            choices.push({id: this.localResource[field.name]});
          } else {
            // TODO: Load external resource with this id
            console.warn("Field not loaded");
          }
        }

        // Add remote results
        choices = [...choices, ...response.data.results];

        // Add display attribute
        choices = choices.map(choice => {return {$display: choice[field.remoteSourceAttribute], ...choice}});

        this.choicesByField[field.name] = [...nullValues, ...choices];
      });
    }

    // Select first autofocus field
    for (const field of this.getFields()) {
        if (field.autofocus) {
            const element = document.getElementById(field.name)
            if (element) {
                setTimeout(() => element.focus(), 50);
                break;
            }
        }
    }
  },
});
</script>
