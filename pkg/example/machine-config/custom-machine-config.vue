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
    // the following map instructs the extension where to find relevant resources in the vuex store for Rancher.
    // The `management` datastore for Rancher contains all Kubernetes resources available on the `local` cluster, the one on which Rancher is running
    const cloudParametersMap = new Map([
      ["machineSizes", "customgroup.com.instancetype"],
      ["vpcs", "customgroup.com.vpc"],
    ]);

    // Here we iterate across all resource types in the map and then get all instances for each type.
    for (const [key, value] of cloudParametersMap.entries()) {
      const cloudParameters = await this.getCloudParametersFromResourceName(
        value
      );

      // The returned value of the getCloudParametersFromResourceName method is a Javascript Object type that has a specific schema (mapped to its Kubernetes schema)
      // In the next step, we transform the list of cloudParameter objects to a list of names of these instances.
      const cloudParameterList = cloudParameters.map((cloudParameter) => {
        return cloudParameter.name;
      });

      // Enriching the local data with the above results
      this.cloudParameters[key].options = cloudParameterList;

    }
  },
  methods: {
    // getCloudParametersFromResourceName is a method that is used to query Rancher's local cluster datastore for all instances of a certain type of Kubernetes resource
    // Here we need to get the schema for the resource type needed (customgroup.com.instancetype or customgroup.com.vpc)
    // Then, we need to get all instances of that resource type
    // The returned value is an object from the datastore
    async getCloudParametersFromResourceName(resourceName) {

      // getters["management/schemaFor"](xxx) gets the schema for a specific resource type from the Rancher local cluster store.
      const cloudParameterType =
        this.$store.getters["management/schemaFor"](resourceName);

      if (cloudParameterType) {
        // dispatch("management/findAll") gets all instances for a specific resource type.
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
