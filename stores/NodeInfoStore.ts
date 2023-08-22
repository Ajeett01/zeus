import { action, observable } from 'mobx';
import NodeInfo from '../models/NodeInfo';
import SettingsStore from './SettingsStore';
import { errorToUserFriendly } from '../utils/ErrorUtils';
import BackendUtils from '../utils/BackendUtils';

export default class NodeInfoStore {
    @observable public loading = false;
    @observable public error = false;
    @observable public errorMsg: string;
    @observable public nodeInfo: NodeInfo | any = {};
    @observable public networkInfo: any = {};
    @observable public testnet: boolean;
    @observable public regtest: boolean;
    settingsStore: SettingsStore;

    constructor(settingsStore: SettingsStore) {
        this.settingsStore = settingsStore;
    }

    reset = () => {
        this.error = false;
        this.loading = false;
        this.nodeInfo = {};
        this.regtest = false;
        this.testnet = false;
        this.errorMsg = '';
    };

    @action
    getNodeInfoError = () => {
        this.error = true;
        this.loading = false;
        this.nodeInfo = {};
    };

    @action
    setLoading = () => {
        this.loading = true;
    };

    private currentRequest: any;

    @action
    public getNodeInfo = () => {
        this.errorMsg = '';
        this.loading = true;
        const currentRequest = (this.currentRequest = {});
        return BackendUtils.getMyNodeInfo()
            .then((data: any) => {
                if (this.currentRequest !== currentRequest) {
                    return;
                }
                const nodeInfo = new NodeInfo(data);
                this.nodeInfo = nodeInfo;
                this.testnet = nodeInfo.isTestNet;
                this.regtest = nodeInfo.isRegTest;
                this.loading = false;
                this.error = false;
                return nodeInfo;
            })
            .catch((error: any) => {
                // handle error
                this.errorMsg = errorToUserFriendly(error.toString());
                this.getNodeInfoError();
            });
    };

    @action
    public getNetworkInfo = () => {
        this.errorMsg = '';
        this.loading = true;
        const currentRequest = (this.currentRequest = {});
        return BackendUtils.getNetworkInfo()
            .then((data: any) => {
                this.networkInfo = data;
                this.loading = false;
                this.error = false;
                return this.networkInfo;
            })
            .catch((error: any) => {
                if (this.currentRequest !== currentRequest) {
                    return;
                }
                // handle error
                this.errorMsg = errorToUserFriendly(error.toString());
                this.getNodeInfoError();
            });
    };
}
