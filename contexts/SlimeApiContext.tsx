import { invoke } from '@tauri-apps/api';
import React, { ReactNode, createContext } from 'react';

import {
	DownloadMediaRequest,
	DownloadMediaResponse,
	SlimeConfig,
	SignNostrMessageRequest,
	SignNostrMessageResponse,
	AddNostrKeypairRequest,
	AddNostrKeypairResponse,
	HasNostrPrivateKeyRequest,
	HasNostrPrivateKeyResponse,
	GetInstallStatusRequest,
	GetInstallStatusResponse,
	GetLocalMediaMetadataRequest,
	GetLocalMediaMetadataResponse,
	InstallMediaRequest,
	InstallMediaResponse,
	LaunchMediaRequest,
	LaunchMediaResponse,
	SaveLocalMediaMetadataRequest,
	SaveLocalMediaMetadataResponse,
	DeleteMediaRequest,
	DeleteMediaResponse,
	UninstallMediaRequest,
	UninstallMediaResponse,
	GetOperatingSystemResponse,
	GenerateTorrentsRequest,
	GenerateTorrentsResponse,
	GetUrlDataHashRequest,
	GetUrlDataHashResponse,
} from '../types/slime/SlimeRpcTypes';

/**
 * Types
 */
interface IContext {
	slimeConfig: SlimeConfig;
	fetchSlimeConfig: () => Promise<SlimeConfig>;
	setSlimeConfig: React.Dispatch<React.SetStateAction<SlimeConfig>>;
	signNostrMessage: (params: SignNostrMessageRequest) => Promise<SignNostrMessageResponse>;
	addNostrKeypair: (params: AddNostrKeypairRequest) => Promise<AddNostrKeypairResponse>;
	hasNostrPrivateKey: (params: HasNostrPrivateKeyRequest) => Promise<HasNostrPrivateKeyResponse>;
	getOperatingSystem: () => Promise<GetOperatingSystemResponse>;
	getInstallStatus: (params: GetInstallStatusRequest) => Promise<GetInstallStatusResponse>;
	getLocalMediaMetadata: (params: GetLocalMediaMetadataRequest) => Promise<GetLocalMediaMetadataResponse>;
	saveLocalMediaMetadata: (params: SaveLocalMediaMetadataRequest) => Promise<SaveLocalMediaMetadataResponse>;
	downloadMedia: (params: DownloadMediaRequest) => Promise<DownloadMediaResponse>;
	deleteMedia: (params: DeleteMediaRequest) => Promise<DeleteMediaResponse>;
	installMedia: (params: InstallMediaRequest) => Promise<InstallMediaResponse>;
	uninstallMedia: (params: UninstallMediaRequest) => Promise<UninstallMediaResponse>;
	launchMedia: (params: LaunchMediaRequest) => Promise<LaunchMediaResponse>;
	generateTorrents: (params: GenerateTorrentsRequest) => Promise<GenerateTorrentsResponse>;
	getUrlDataHash: (params: GetUrlDataHashRequest) => Promise<GetUrlDataHashResponse>;
}

/**
 * Context
 */
export const SlimeApiContext = createContext<IContext>({} as IContext);

/**
 * Provider
 */
export const SlimeApiContextProvider = ({ children }: { children: ReactNode | ReactNode[] }) => {
	const [slimeConfig, setSlimeConfig] = React.useState<SlimeConfig>({
		nostrRelays: [{ displayName: 'Slime Relay 1', url: 'ws://api.slimenetwork.org:7000' }],
		activeMarketplace: { displayName: 'Slime Marketplace', url: 'http://api.slimenetwork.org' },
		installsPath: './slime-data/installs/',
		marketplaces: [{ displayName: 'Slime Marketplace', url: 'http://api.slimenetwork.org' }],
		mediaDataPath: './slime-data/media/',
		mintingDataPath: './slime-data/minting/',
		torrentsPath: './slime-data/torrents/',
		activeIdentity: { did: '', currentNostrPublicKey: '', proof: '' },
		identities: [],
		torrentClientPort: 5235,
		default: true,
	});

	React.useEffect(() => {
		const fetchConfig = async () => {
			const configResponse: any = await invoke('get_config');
			console.log('get_config', configResponse);
			configResponse.result.default = false;
			setSlimeConfig(configResponse.result);
		};

		if (slimeConfig.default) {
			console.log('fetchConfig');
			fetchConfig();
		} else {
			console.log('has slimeConfig', slimeConfig);
			const configResponse: any = invoke('save_config', { newConfig: slimeConfig });
			console.log('save_config', configResponse);
		}
	}, [slimeConfig]);

	const fetchSlimeConfig = async () => {
		if (slimeConfig) {
			return slimeConfig;
		}
		const configResponse: any = await invoke('get_config');
		console.log('fetchSlimeConfig', configResponse);
		configResponse.result.default = false;
		setSlimeConfig(configResponse.result);
		return configResponse.result;
	};

	const signNostrMessage = async (params: SignNostrMessageRequest) => {
		try {
			return (await invoke('sign_nostr_message', { params })) as SignNostrMessageResponse;
		} catch (e) {
			console.error(e);
			return { signature: '', message: e, status: 'error' } as SignNostrMessageResponse;
		}
	};

	const addNostrKeypair = async (params: AddNostrKeypairRequest) => {
		try {
			return (await invoke('add_nostr_keypair', { params })) as AddNostrKeypairResponse;
		} catch (e) {
			console.error(e);
			return { message: e, status: 'error' } as AddNostrKeypairResponse;
		}
	};

	const hasNostrPrivateKey = async (params: HasNostrPrivateKeyRequest) => {
		try {
			return (await invoke('has_nostr_private_key', { params })) as HasNostrPrivateKeyResponse;
		} catch (e) {
			console.error(e);
			return { hasPrivateKey: false, message: e, status: 'error' } as HasNostrPrivateKeyResponse;
		}
	};

	const getOperatingSystem = async () => {
		try {
			return (await invoke('get_operating_system')) as GetOperatingSystemResponse;
		} catch (e) {
			console.error(e);
			return { message: e, platform: 'error', status: 'error' } as GetOperatingSystemResponse;
		}
	};

	const getInstallStatus = async (params: GetInstallStatusRequest) => {
		try {
			return (await invoke('get_install_status', { params })) as GetInstallStatusResponse;
		} catch (e) {
			console.error(e);
			return { message: e, status: 'error' } as GetInstallStatusResponse;
		}
	};

	const getLocalMediaMetadata = async (params: GetLocalMediaMetadataRequest) => {
		try {
			return (await invoke('get_local_media_metadata', { params })) as GetLocalMediaMetadataResponse;
		} catch (e) {
			console.error(e);
			return { media: {}, message: e, status: 'error' } as GetLocalMediaMetadataResponse;
		}
	};

	const saveLocalMediaMetadata = async (params: SaveLocalMediaMetadataRequest) => {
		try {
			return (await invoke('save_local_media_metadata', { params })) as SaveLocalMediaMetadataResponse;
		} catch (e) {
			console.error(e);
			return { message: e, status: 'error' } as SaveLocalMediaMetadataResponse;
		}
	};

	const downloadMedia = async (params: DownloadMediaRequest) => {
		try {
			return (await invoke('download_media', { params })) as DownloadMediaResponse;
		} catch (e) {
			console.error(e);
			return { message: e, status: 'error' } as DownloadMediaResponse;
		}
	};

	const deleteMedia = async (params: DeleteMediaRequest) => {
		try {
			return (await invoke('delete_media', { params })) as DeleteMediaResponse;
		} catch (e) {
			console.error(e);
			return { message: e, status: 'error' } as DeleteMediaResponse;
		}
	};

	const installMedia = async (params: InstallMediaRequest) => {
		try {
			return (await invoke('install_media', { params })) as InstallMediaResponse;
		} catch (e) {
			console.error(e);
			return { message: e, status: 'error' } as InstallMediaResponse;
		}
	};

	const uninstallMedia = async (params: UninstallMediaRequest) => {
		try {
			return (await invoke('uninstall_media', { params })) as UninstallMediaResponse;
		} catch (e) {
			console.error(e);
			return { message: e, status: 'error' } as UninstallMediaResponse;
		}
	};

	const launchMedia = async (params: LaunchMediaRequest) => {
		try {
			return (await invoke('launch_media', { params })) as LaunchMediaResponse;
		} catch (e) {
			console.error(e);
			return { message: e, status: 'error' } as LaunchMediaResponse;
		}
	};

	const generateTorrents = async (params: GenerateTorrentsRequest) => {
		try {
			return (await invoke('generate_torrents', { params })) as GenerateTorrentsResponse;
		} catch (e) {
			console.error(e);
			return { message: e, status: 'error' } as unknown as GenerateTorrentsResponse;
		}
	};

	const getUrlDataHash = async (params: GetUrlDataHashRequest) => {
		try {
			return (await invoke('get_url_data_hash', { params })) as GetUrlDataHashResponse;
		} catch (e) {
			console.error(e);
			return { message: e, status: 'error' } as unknown as GetUrlDataHashResponse;
		}
	};

	return (
		<SlimeApiContext.Provider
			value={{
				slimeConfig,
				fetchSlimeConfig,
				setSlimeConfig,
				signNostrMessage,
				addNostrKeypair,
				hasNostrPrivateKey,
				getOperatingSystem,
				getInstallStatus,
				getLocalMediaMetadata,
				saveLocalMediaMetadata,
				downloadMedia,
				deleteMedia,
				installMedia,
				uninstallMedia,
				launchMedia,
				generateTorrents,
				getUrlDataHash,
			}}
		>
			{children}
		</SlimeApiContext.Provider>
	);
};

export const useSlimeApi = () => {
	const context = React.useContext(SlimeApiContext);
	if (context === undefined) {
		throw new Error('useSlimeApi must be used within a SlimeApiContextProvider');
	}
	return context;
};