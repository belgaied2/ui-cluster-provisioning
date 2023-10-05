<script>
import LabeledSelect from "@shell/components/form/LabeledSelect.vue";

function initOptions() {
  return    {
      options:     [],
      selected:  null,
    };
}

export default {
  components: {
    LabeledSelect,
  },
  data() {
    return {
      cloudParameters: { 
        machineSizes: initOptions(),
        vpcs:         initOptions(),
      },
    };
  },
  async fetch() {
    const cloudParametersMap = new Map([
      ["machineSizes", "customgroup.com.instancetype"],
      ["vpcs", "customgroup.com.vpc"],
    ]);

    for (const [key, value] of cloudParametersMap.entries()) {
      const cloudParameters = await this.getCloudParametersFromResourceName(
        value
      );

      const cloudParameterList = cloudParameters.map((cloudParameter) => {
        return cloudParameter.name;
      });
      //console.log(cloudParameterList);

      this.cloudParameters[key].options = cloudParameterList;

    }
  },
  methods: {
    async getCloudParametersFromResourceName(resourceName) {
      const cloudParameterType =
        this.$store.getters["management/schemaFor"](resourceName);

      if (cloudParameterType) {
        return await this.$store.dispatch("management/findAll", {
          type: resourceName,
        });
      }
    },
  },
};
</script>
<template>
  <div>
    <div class="openstack-config">
      <div class="title">custom-config</div>
    </div>
    <div class="row mt-10">
      <div class="col span-6">
        <LabeledSelect
          v-model="cloudParameters.machineSizes.selected"
          label="Machine Size"
          :options="cloudParameters.machineSizes.options"
        />
      </div>
      <div class="col span-6">
        <LabeledSelect
          v-model="cloudParameters.vpcs.selected"
          label="Virtual Private Cloud (VPC)"
          :options="cloudParameters.vpcs.options"
          />
      </div>
    </div>
  </div>
</template>
