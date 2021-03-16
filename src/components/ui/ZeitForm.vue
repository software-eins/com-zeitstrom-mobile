<template>
  <div>
    <ion-item v-for="(field, idx) of getFields()" :key="idx" :lines="idx + 1 == getFields().length ? lastLine : undefined">
      <ion-label position="stacked" class="w-full" color="danger" v-if="errors && errors[field.name]">{{ errors[field.name][0] }}</ion-label>

      <div class="w-full flex items-center" v-if="field.mobileType == 'text'">
        <ion-label>{{ field.label }}</ion-label>
        <ion-input
          v-if="!field.isReadOnly && !disabled"
          slot="end"
          class="text-right"
          v-model="localResource[field.name]"
        />
        <ion-input v-else-if="(field.isReadOnly || disabled) && !field.renderer" disabled slot="end" class="text-right" :value="localResource[field.name] || field.default" />
        <div v-else slot="end" class="text-right flex-grow">
            <zeit-promise-solver :promise="field.renderer(localResource)" :key="localResource[field.name]" />
        </div>
      </div>
      <template v-else-if="field.mobileType == 'stacked'">
        <ion-label position="stacked">{{ field.label }}</ion-label>
        <ion-input
          :disabled="field.isReadOnly || disabled"
          v-model="localResource[field.name]"
        />
      </template>
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
      <template v-else>
        {{ field.mobileType }}
      </template>
    </ion-item>
  </div>
</template>

<style scoped>
    .color-box {
        width: 53px;
        height: 25px;
    }
    .color-box.active {
        box-shadow: 0px 0px 5px 3px rgba(var(--ion-color-primary-rgb), .6);
    }
    .color-box:not(.active):hover {
        box-shadow: 0px 0px 3px 2px rgba(var(--ion-color-medium-rgb), .2);
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

export default defineComponent({
  components: { IonItem, IonInput, IonLabel, IonSelect, IonToggle, IonSelectOption, IonSpinner, ZeitPromiseSolver, IonDatetime, },
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
    getFields() {
      return (this.formFields || this.service.formFields).filter(field => {
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
        if (this.resource && this.resource.id) {
            this.localResource = JSON.parse(JSON.stringify(this.resource));
            this.mode = "edit";
        }
    },
    removeSecondsFromTime(event, fieldName) {
      const newTime = event.detail.value;
      event.detail.value = newTime.slice(0, 17) + '00.000' + newTime.slice(23);
      this.localResource[fieldName] = newTime.slice(0, 17) + '00.000' + newTime.slice(23);
    }
  },

  watch: {
    localResource: {
        deep: true,
        handler(newResource) {
          this.$emit('update:resource', newResource);
        },
    },
  },

  mounted() {
    this.copyRemoteResource();

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
  },
});
</script>
