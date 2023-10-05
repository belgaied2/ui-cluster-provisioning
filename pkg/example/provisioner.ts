import { RegisterClusterSaveHook, IClusterProvisioner, ClusterProvisionerContext } from '@shell/core/types';

import { CAPI as CAPI_LABELS } from '@shell/config/labels-annotations';

const RANCHER_CLUSTER = 'provisioning.cattle.io.cluster';

export class ExampleProvisioner implements IClusterProvisioner {
  static ID = 'custom-mbelgaied';
  /* eslint-disable no-useless-constructor */
  constructor(private context: ClusterProvisionerContext) { }

  get id(): string {
    return ExampleProvisioner.ID;
  }

  get namespaced(): boolean {
    return true;
  }

  get icon(): any {
    return require('./icon.svg');
  }

  get machineConfigSchema(): { [key: string]: any } {
    return { id: 'rke-machine-config.cattle.io.testconfig' };
  }

  get description(): string {
    return this.context.t('provisioner.description');
  }

  get tag(): string {
    return this.context.t('provisioner.tag');
  }

  async createMachinePoolMachineConfig(idx: number, pools: any, cluster: any) { // eslint-disable-line require-await
    this.debug('createMachinePoolMachineConfig', idx, pools, cluster);

    return {};
  }

  registerSaveHooks(registerBeforeHook: RegisterClusterSaveHook, registerAfterHook: RegisterClusterSaveHook, cluster: any): void {
    this.debug('registerSaveHooks', registerBeforeHook, registerAfterHook, cluster, this);

    registerBeforeHook(this.beforeSave, 'custom-before-hook', 99);
    registerAfterHook(this.afterSave, 'custom-after-hook', 99, this);
  }

  /**
   * Example of a function that will run in the before the cluster is saved
   *
   * When `provision` is implemented the before / after save hooks are skipped
   *
   * This example hasn't been registered with a `fnContext` param, so the `this` context is the vue component from hte ui
   */
  async beforeSave(cluster: any) { // eslint-disable-line require-await
    console.debug('example provisioner before save hook', ...arguments);

    const clusterFromComponent = (this as any).value;

    clusterFromComponent.metadata.annotations = cluster.metadata.annotations || {};
    clusterFromComponent.metadata.annotations[CAPI_LABELS.UI_CUSTOM_PROVIDER] = ExampleProvisioner.ID;
  }

  /**
   * Example of a function that will run in the after hook
   *
   * When `provision` is implemented the before / after save hooks are skipped
   */
  async afterSave(cluster: any) { // eslint-disable-line require-await
    this.debug('example provisioner after save hook', ...arguments);
  }

  async saveMachinePoolConfigs(pools: any[], cluster: any) { // eslint-disable-line require-await
    this.debug('saveMachinePoolConfigs', pools, cluster);

    return true;
  }

  get detailTabs() {
    return {
      machines:     false,
      logs:         false,
      registration: false,
      snapshots:    false,
      related:      true,
      events:       false,
      conditions:   false,
    };
  }

  // Returns an array of error messages or an empty array if provisioning was successful
  async provision(cluster: any, pools: any): Promise<any[]> {
    this.debug('provision', cluster, pools);

    const { dispatch } = this.context;

    cluster.metadata.annotations = cluster.metadata.annotations || {};
    cluster.metadata.annotations[CAPI_LABELS.UI_CUSTOM_PROVIDER] = this.id;

    // Create an empty cluster - this will show up as an imported cluster in the UI
    const rancherCluster = await dispatch('management/create', {
      type:     RANCHER_CLUSTER,
      metadata: {
        name:      cluster.name,
        namespace: cluster.namespace,
      },
      spec: { rkeConfig: {} }
    });

    this.debug(rancherCluster);

    try {
      await cluster.save();
    } catch (e) {
      console.error(e); // eslint-disable-line no-console

      return [e];
    }

    return [];
  }

  private debug(...args: any[]) {
    console.debug('example provisioner', ...args, this.context);
  }
}
