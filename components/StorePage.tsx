import { Buffer } from 'buffer';

import CloseIcon from '@mui/icons-material/Close';
import {
	Grid, Tab, Tabs, Dialog, Container, Typography, Button,
	CardMedia, AppBar, Toolbar, Card, Slide, IconButton, Box,
	Stack, Divider, Autocomplete, TextField, SlideProps
} from '@mui/material';
import axios from "axios";
import { bech32m } from "bech32";
import { sha256 } from 'js-sha256';
import * as React from 'react';
import { Dispatch, SetStateAction, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';


import { Media } from '../types/gosti/Media';

const Transition = React.forwardRef((props: SlideProps, ref) => <Slide direction="up" ref={ref} {...props} />);

export type TabPanelProps = {
	children: any,
	index: number,
	value: number,
};

function TabPanel(props: TabPanelProps) {
	const { children, value, index, ...other } = props;

	return (
		<div
			role="tabpanel"
			hidden={value !== index}
			id={`full-width-tabpanel-${index}`}
			aria-labelledby={`full-width-tab-${index}`}
			{...other}
		>
			{value === index && (
				<Box sx={{ p: 3 }}>
					<Typography>{children}</Typography>
				</Box>
			)}
		</div>
	);
}

function TabProps(index: number) {
	return {
		id: `full-width-tab-${index}`,
		'aria-controls': `full-width-tabpanel-${index}`,
	};
}

export type StorePageProps = {
	media: Media;
	setActiveOffer: Dispatch<SetStateAction<string>>;
	onBuy: () => void;
	open: boolean,
	setOpen: Dispatch<SetStateAction<boolean>>
};

export default function StorePage(props: StorePageProps) {
	const { media, setActiveOffer, onBuy, open, setOpen } = props;

	const [price, setPrice] = React.useState("");
	const [asset, setAsset] = React.useState('TXCH');
	const [tab, setTab] = React.useState(0);

	useEffect(() => {
		if (open) {
			const pubdid = media.publisherDid;
			const id = media.productId;

			if (!pubdid || !id) return;

			const decoded = Buffer.from(bech32m.fromWords(bech32m.decode(pubdid).words)).toString("hex");

			const col = sha256.create().update(decoded + id).hex();
			const collectionID = bech32m.encode("col", bech32m.toWords(Buffer.from(col, "hex")));

			axios.get(`https://api-testnet.dexie.space/v1/offers`, { params: { requested: asset, offered: collectionID, page_size: 1 } })
				.then(res => {
					console.log(res);
					if (res.data.offers.length > 0) {
						setActiveOffer(res.data.offers[0].offer);
						setPrice(res.data.offers[0].requested[0].amount);
					} else {
						setPrice("Not Found");
					}
				}
				);
		}
	}, [asset, media, open, setActiveOffer]);

	const assets = [
		'TXCH', 'USDS', 'SBX'
	];

	const handleClose = () => {
		setOpen(false);
	};

	const handleTabChange = (event: React.SyntheticEvent<Element, Event>, newValue: number) => {
		setTab(newValue);
	};

	return (
		<Dialog
			fullScreen
			open={open}
			onClose={handleClose}
			TransitionComponent={Transition}
		>
			<AppBar sx={{ position: 'relative' }}>
				<Toolbar>
					<IconButton
						edge="start"
						color="inherit"
						onClick={handleClose}
						aria-label="close"
					>
						<CloseIcon />
					</IconButton>
					<Typography sx={{ ml: 2, flex: 1 }} variant="h6">
						{media.title}
					</Typography>
				</Toolbar>
			</AppBar>
			<Container fixed>
				<AppBar position="static">
					<Tabs
						value={tab}
						onChange={handleTabChange}
						indicatorColor="secondary"
						textColor="inherit"
						variant="fullWidth"
					>
						<Tab label="Trailer" {...TabProps(0)} />
						<Tab label="Screenshots" {...TabProps(1)} />
					</Tabs>
				</AppBar>
				<Grid container height={420} sx={{ width: '100%', m: 0 }}>
					<Grid id="mediaSection" item xs={12} md={8} sx={{ m: 0, p: 0, height: '100%' }}>
						<TabPanel value={tab} index={0}>
							<Card sx={{ m: 0, p: 2, height: '100%' }} >
								<CardMedia
									component="iframe"
									src={(media.trailerSource === 'youtube') ? `https://www.youtube.com/embed/${media.trailer}?autoplay=1&origin=http://.com` : ""}
									height={'360'}
								/>
							</Card>
						</TabPanel>
						<TabPanel value={tab} index={1}>
							{price}
						</TabPanel>
					</Grid>
					<Grid id="infoSection" item xs={12} md={4} sx={{ height: '100%' }}>
						<Stack sx={{ height: '100%' }}>
							<Card sx={{ p: 1, m: 1, height: '60%' }}>
								<Typography p={1} variant="h5">{media.title}</Typography>
								<Divider />
								<Typography p={2}>{media.description}</Typography>
								<Divider />
								<Typography p={2}>{media.tags}</Typography>
							</Card>
							<Card sx={{ m: 1, height: '40%' }}>
								<Grid container>
									<Grid p={2} item sx={{ width: .5 }}>
										<Typography p={2}>{price} {asset}</Typography>
										<Button fullWidth={true} variant="contained" onClick={onBuy}>Buy</Button>
									</Grid>
									<Grid p={4} item sx={{ width: .5 }}>
										<Autocomplete
											id="asset-combo-box"
											disableClearable
											disablePortal
											freeSolo
											defaultValue='XCH'
											options={assets}
											sx={{ width: 150 }}
											renderInput={(params) => <TextField {...params} />}
											onChange={(event: any, newAsset: string | null) => {
												if (newAsset && newAsset !== asset) {
													setAsset(newAsset);
												}
											}}
										/>
									</Grid>
								</Grid>
							</Card>
						</Stack>
					</Grid>
					<Card sx={{ m: 1, p: 4, width: '100%' }}>
						<ReactMarkdown children={media.longDescription} />
					</Card>
				</Grid>
			</Container>
		</Dialog>
	);
};

