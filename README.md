# Rancher Cluster Provisioning Example

This repository illustrates custom cluster provisioning via Rancher Extensions without requiring
Node Drivers.

This is work in progress.

## To use

In a separate folder, clone this fork and branch of the Rancher Dashboard with:

```
git clone -b `master` https://github.com/rancher/dashboard.git
```

> Until https://github.com/rancher/dashboard/pull/9246 merges use `git clone -b cluster-prov-extensions https://github.com/nwmac/dashboard.git`

Then:

```
cd dashboard/shell
yarn link
```

This will link the Dashboard code you checked out above for the `@rancher/shell` packages.

Back in the folder for the checkout of this repository, link to the shell above with:

```
yarn install
yarn link @rancher/shell
```

Set the `API` environment variable to point to your Rancher backend and run with:

```
yarn dev
```

This should run the Dashboard with the example extension defined in `pkg/example`, built and running
against the Dashboard shell code checkout out in the first step above.


## Notes

If the definitions in `dashboard` change run `./shell/scripts/typegen.sh` in the dashboard root to update the versions used by extensions. 

This repository adds contains two examples that illustrates custom provisioners that leverage the RKE2 flow. The `example` extension leverages the same Cloud Credential and Machine Config components as with Node Drivers but does not require a node driver AND allows the custom provisioner to control the actual provisioning step in a couple of ways.

Note that the changes to allow extensions to add cards to the provisioning screen will support using a `link` - allowing an extension to add a provider choice to the UI that when clicked, takes the user to a new route where the extension would need to take care of providing *all* UI and provisioning.


## From zero to hero

This is a rough framework for developing custom cluster creating from within an extension

### Get to know extensions
Read through the home page and Introduction over at https://rancher.github.io/dashboard/extensions/home. This will be the location of all the docs relating to how extensions work and what can be done with them

### Create the skeleton UI and extension

1. Create a GitHub repo for your extension
1. Create a Rancher UI application within the repo - https://rancher.github.io/dashboard/extensions/extensions-getting-started#creating-the-skeleton-app
1. Create a Rancher UI extension within your repo - https://rancher.github.io/dashboard/extensions/extensions-getting-started#creating-an-extension-as-a-top-level-product
1. Run the Rancher UI and validate your extension exists - https://rancher.github.io/dashboard/extensions/extensions-getting-started#running-the-app
1. Use the latest and greatest Rancher UI whilst developing the extension 
    1. clone the `rancher/dashboard` repo
    1. checkout the `master` branch
    1. run `yarn link`
    1. go to your repo and run `yarn link @rancher/shell`
    > Once the required Rancher UI changes are published this step won't be needed

### Start developing the provisioner extension

You're now ready to start developing the extension plugin
1. Remove the `product` in you pkg's index (this is just to get you started)
1. Read the documentation, specifically https://rancher.github.io/dashboard/extensions/advanced/provisioning
1. Review the two example provisioning extensions in this repo
1. Start creating components and applying hooks in your extension

#### Testing 

As part of development/testing process you should consider the following cases
- Create, edit, remove a cluster
- Add. edit and remove machine pools from a running cluster
- Provisioning / Managing cluster as non-admins
- Making use of all required features when creating/editing the cluster, specifically the vertical tabs below the machine pool section

#### Getting ready for Production

Once the development process is near completion, it's best to switch to building and loading the extension rather than building the dashboard with it included. This involves two steps
1. Use the shipped dashboard when building the extension
   - Ensure that the local dashboard is not used by running `yarn unlink @rancher/shell` in the root of your repo
   - Ensure the `package.json` entry for `rancher/dashboard` refers to the latest version
   - `yarn install --force`
2. Build and run your extension
    - Development Cycle
      - In your instance of rancher you will need to use the latest UI. To do so use the build we provide and the instructions at https://rancher.github.io/dashboard/guide/custom-dev-build
      - In your development cycle
      - `yarn build <package name>`
      - `yarn serve-pkgs`
      - In your dashboard enable loading of development extensions via user avatar top right --> `Preferences` --> check `Enable Extension developer features`
      - Load your extension via burger menu top left --> `Extensions` --> three dot menu top right `Developer Load` --> add the url provided via `yarn serve-pkgs` and check 'Persist extension by creating custom resource`
        - This behaves like any other extension and can be removed
   - Release / Production Cycle
      - Non-air-gapped Rancher Install
         - Build your container image and helm charts, and publish to github. 
         - These will result in a helm repo that can be added to the local/upstream cluster. Rancher will then show the extension in the Extensions page
         - See https://rancher.github.io/dashboard/extensions/publishing for instructions
      - Air-gapped Rancher Install
         - Build your container image and helm charts, and publish them as an image to your container registry
         - See https://rancher.github.io/dashboard/extensions/advanced/air-gapped-environments for instructions
      
