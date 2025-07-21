import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';
import { NodeConnectionType } from 'n8n-workflow';
import FormData from 'form-data';

export class EasySlip implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'EasySlip',
		name: 'easySlip',
		icon: 'file:easyslip.svg',
		group: ['transform'],
		version: 1,
		subtitle: 'Slip Verification',
		description: 'Verify bank slips and Truemoney wallet slips using EasySlip API',
		defaults: {
			name: 'EasySlip',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [
			{
				type: NodeConnectionType.Main,
				displayName: 'Matched / All',
			},
			{
				type: NodeConnectionType.Main,
				displayName: 'Not Matched',
			},
		],
		usableAsTool: true,
		credentials: [
			{
				name: 'easySlipApi',
				required: true,
			},
		],
		requestDefaults: {
			baseURL: 'https://developer.easyslip.com/api/v1',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Bank Slip',
						value: 'bankSlip',
					},
					{
						name: 'Truemoney Wallet',
						value: 'truemoneyWallet',
					},
				],
				default: 'bankSlip',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['bankSlip'],
					},
				},
				options: [
					{
						name: 'Verify by Payload',
						value: 'verifyByPayload',
						description: 'Verify bank slip using payload data',
						action: 'Verify by payload a bank slip',
					},
					{
						name: 'Verify by Image',
						value: 'verifyByImage',
						description: 'Verify bank slip using image file',
						action: 'Verify by image a bank slip',
					},
					{
						name: 'Verify by Base64',
						value: 'verifyByBase64',
						description: 'Verify bank slip using base64 encoded image',
						action: 'Verify by base64 a bank slip',
					},
					{
						name: 'Verify by URL',
						value: 'verifyByUrl',
						description: 'Verify bank slip using image URL',
						action: 'Verify by URL a bank slip',
					},
				],
				default: 'verifyByPayload',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['truemoneyWallet'],
					},
				},
				options: [
					{
						name: 'Verify by Image',
						value: 'verifyByImage',
						description: 'Verify Truemoney wallet slip using image',
						action: 'Verify by image a truemoney wallet',
					},
				],
				default: 'verifyByImage',
			},
			{
				displayName: 'Check Duplicate',
				name: 'checkDuplicate',
				type: 'boolean',
				displayOptions: {
					show: {
						resource: ['truemoneyWallet'],
						operation: ['verifyByImage'],
					},
				},
				default: false,
				description: 'Whether to check for duplicate slips',
			},
			// Bank Slip - Verify by Payload fields
			{
				displayName: 'Payload',
				name: 'payload',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['bankSlip'],
						operation: ['verifyByPayload'],
					},
				},
				default: '',
				description: 'QR code data from the bank slip',
			},
			{
				displayName: 'Check Duplicate',
				name: 'checkDuplicate',
				type: 'boolean',
				displayOptions: {
					show: {
						resource: ['bankSlip'],
						operation: ['verifyByPayload', 'verifyByBase64', 'verifyByUrl', 'verifyByImage'],
					},
				},
				default: false,
				description: 'Whether to check for duplicate slips',
			},
			// Image-based verification fields
			{
				displayName: 'Image Data',
				name: 'imageData',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['bankSlip', 'truemoneyWallet'],
						operation: ['verifyByBase64'],
					},
				},
				default: '',
				description: 'Base64 encoded image data',
			},
			{
				displayName: 'Image URL',
				name: 'imageUrl',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['bankSlip'],
						operation: ['verifyByUrl'],
					},
				},
				default: '',
				description: 'URL of the slip image to verify',
			},
			{
				displayName: 'Image Binary Property',
				name: 'imageBinaryProperty',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['bankSlip', 'truemoneyWallet'],
						operation: ['verifyByImage'],
					},
				},
				default: 'data',
				description: 'Name of the binary property containing the image',
			},
			// Response Filtering Options
			{
				displayName: 'Additional Options',
				name: 'additionalOptions',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				displayOptions: {
					show: {
						resource: ['bankSlip'],
					},
				},
				options: [
					{
						displayName: 'Filter by Receiver Bank Code',
						name: 'receiverBankCode',
						type: 'options',
						options: [
							{
								name: 'All Banks',
								value: '',
							},
							{
								name: 'ธนาคารกรุงเทพ (BBL)',
								value: '002',
							},
							{
								name: 'ธนาคารกรุงไทย (KTB)',
								value: '006',
							},
							{
								name: 'ธนาคารกรุงศรีอยุธยา (BAY)',
								value: '025',
							},
							{
								name: 'ธนาคารกสิกรไทย (KBANK)',
								value: '004',
							},
							{
								name: 'ธนาคารเกียรตินาคินภัทร (KKP)',
								value: '069',
							},
							{
								name: 'ธนาคารซีไอเอ็มบีไทย (CIMBT)',
								value: '022',
							},
							{
								name: 'ธนาคารทหารไทยธนชาต (TTB)',
								value: '011',
							},
							{
								name: 'ธนาคารทิสโก้ (TISCO)',
								value: '067',
							},
							{
								name: 'ธนาคารไทยเครดิตเพื่อรายย่อย (TCD)',
								value: '071',
							},
							{
								name: 'ธนาคารไทยพาณิชย์ (SCB)',
								value: '014',
							},
							{
								name: 'ธนาคารพัฒนาวิสาหกิจขนาดกลางและขนาดย่อยแห่งประเทศไทย (SME)',
								value: '098',
							},
							{
								name: 'ธนาคารเพื่อการเกษตรและสหกรณ์การเกษตร (BAAC)',
								value: '034',
							},
							{
								name: 'ธนาคารเพื่อการส่งออกและนำเข้าแห่งประเทศไทย (EXIM)',
								value: '035',
							},
							{
								name: 'ธนาคารยูโอบี (UOBT)',
								value: '024',
							},
							{
								name: 'ธนาคารแลนด์ แอนด์ เฮ้าส์ (LHFG)',
								value: '073',
							},
							{
								name: 'ธนาคารออมสิน (GSB)',
								value: '030',
							},
							{
								name: 'ธนาคารอาคารสงเคราะห์ (GHB)',
								value: '033',
							},
							{
								name: 'ธนาคารไอซีบีซี (ไทย) (ICBCT)',
								value: '070',
							},
						],
						default: '',
						description:
							'Filter results by specific receiver bank code - non-matching items go to second output',
					},
					{
						displayName: 'Filter by Receiver Name',
						name: 'receiverName',
						type: 'string',
						default: '',
						description:
							'Filter results by receiver name (partial match) - non-matching items go to second output',
					},
					{
						displayName: 'Enable Debug Logging',
						name: 'enableDebugLogging',
						type: 'boolean',
						default: false,
						description: 'Whether to enable console logging for debugging purposes',
					},
				],
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const matchedData: INodeExecutionData[] = [];
		const filteredData: INodeExecutionData[] = [];

		// Check if any filters are enabled to determine output structure
		let hasAnyFilters = false;
		for (let i = 0; i < items.length; i++) {
			const resource = this.getNodeParameter('resource', i) as string;
			if (resource === 'bankSlip') {
				const additionalOptions = this.getNodeParameter('additionalOptions', i, {}) as any;
				const { receiverBankCode, receiverName } = additionalOptions;
				if (receiverBankCode || receiverName) {
					hasAnyFilters = true;
					break;
				}
			}
		}

		// Helper function to check if any filters are applied
		const hasFilters = (additionalOptions: any): boolean => {
			const { receiverBankCode, receiverName } = additionalOptions;
			return !!(receiverBankCode || receiverName);
		};

		// Helper function for debug logging
		const debugLog = (message: string, data?: any, itemIndex: number = 0): void => {
			try {
				const additionalOptions = this.getNodeParameter('additionalOptions', itemIndex, {}) as any;
				if (additionalOptions.enableDebugLogging) {
					if (data) {
						console.log(`[EasySlip Debug] ${message}`, data);
					} else {
						console.log(`[EasySlip Debug] ${message}`);
					}
				}
			} catch (error) {
				// Silently fail if debug logging option is not available
			}
		};

		// Helper function to check if response matches filter criteria
		const matchesFilters = (
			responseData: any,
			additionalOptions: any,
			itemIndex: number = 0,
		): boolean => {
			// If no response data or no data property, return true (no filtering)
			if (!responseData || !responseData.data) {
				debugLog('No response data or data property - returning true', responseData, itemIndex);
				return true;
			}

			const { receiverBankCode, receiverName } = additionalOptions;
			debugLog('Filter criteria:', { receiverBankCode, receiverName }, itemIndex);
			debugLog(
				'Response data structure:',
				{
					hasReceiver: !!responseData.data.receiver,
					hasReceiverBank: !!responseData.data.receiver?.bank,
					receiverBankId: responseData.data.receiver?.bank?.id,
					receiverName: responseData.data.receiver?.account?.name?.th,
				},
				itemIndex,
			);

			// Log the full response data for debugging
			if (receiverBankCode || receiverName) {
				debugLog('Full response data for debugging:', responseData, itemIndex);
			}

			// Check receiver bank code filter
			if (receiverBankCode) {
				if (!responseData.data.receiver?.bank?.id) {
					debugLog(
						'Receiver bank code filter failed - no receiver bank id in response',
						undefined,
						itemIndex,
					);
					return false;
				}

				// Compare bank codes directly - API returns them as 3-digit strings like "004"
				const expectedBankCode = receiverBankCode.toString();
				const actualBankCode = responseData.data.receiver.bank.id.toString();

				debugLog(
					'Receiver bank code comparison:',
					{
						expected: expectedBankCode,
						actual: actualBankCode,
						match: actualBankCode === expectedBankCode,
					},
					itemIndex,
				);

				if (actualBankCode !== expectedBankCode) {
					debugLog('Receiver bank code filter failed - no match', undefined, itemIndex);
					return false;
				}
			}

			// Check receiver name filter
			if (receiverName) {
				if (!responseData.data.receiver?.account?.name?.th) {
					debugLog(
						'Receiver name filter failed - no receiver name in response',
						undefined,
						itemIndex,
					);
					return false;
				}

				const receiverNameLower = receiverName.toLowerCase().trim();
				const actualReceiverName = responseData.data.receiver.account.name.th.toLowerCase().trim();

				debugLog(
					'Receiver name comparison:',
					{
						expected: receiverNameLower,
						actual: actualReceiverName,
						match: actualReceiverName.includes(receiverNameLower),
					},
					itemIndex,
				);

				if (!actualReceiverName.includes(receiverNameLower)) {
					debugLog('Receiver name filter failed - no match', undefined, itemIndex);
					return false;
				}
			}

			debugLog('All filters passed - returning true', undefined, itemIndex);
			return true;
		};

		for (let i = 0; i < items.length; i++) {
			try {
				const resource = this.getNodeParameter('resource', i) as string;
				const operation = this.getNodeParameter('operation', i) as string;

				// Get additional options for filtering (only for bank slips)
				const additionalOptions =
					resource === 'bankSlip' ? (this.getNodeParameter('additionalOptions', i, {}) as any) : {};

				debugLog(
					`Processing item ${i + 1}/${items.length}: ${resource} - ${operation}`,
					undefined,
					i,
				);
				debugLog('Additional options:', additionalOptions, i);

				if (resource === 'bankSlip') {
					switch (operation) {
						case 'verifyByPayload':
							const payload = this.getNodeParameter('payload', i) as string;
							const checkDuplicate = this.getNodeParameter('checkDuplicate', i) as boolean;

							// Build query parameters
							let queryString = `payload=${encodeURIComponent(payload)}&checkDuplicate=${checkDuplicate}`;
							const finalUrl = `https://developer.easyslip.com/api/v1/verify?${queryString}`;

							debugLog('Bank Slip - Verify by Payload', undefined, i);
							debugLog('Request URL:', finalUrl, i);
							debugLog('Check duplicate:', checkDuplicate, i);

							// Make GET request directly with query parameters
							const payloadCredentials = await this.getCredentials('easySlipApi');

							try {
								const payloadResponse = await this.helpers.httpRequest({
									method: 'GET',
									url: finalUrl,
									headers: {
										Authorization: `Bearer ${payloadCredentials.accessToken}`,
									},
								});

								// Check if filters are applied and handle dual output
								if (resource === 'bankSlip' && hasFilters(additionalOptions)) {
									const matches = matchesFilters(payloadResponse, additionalOptions, i);
									debugLog('Filtering applied - matches:', matches, i);
									if (matches) {
										matchedData.push({
											json: payloadResponse,
											pairedItem: { item: i },
										});
									} else {
										debugLog('Filter does not match - routing to second output', undefined, i);
										filteredData.push({
											json: payloadResponse,
											pairedItem: { item: i },
										});
									}
								} else {
									// No filters applied, use single output
									debugLog('No filters applied - using single output', undefined, i);
									matchedData.push({
										json: payloadResponse,
										pairedItem: { item: i },
									});
								}
							} catch (error: any) {
								// Handle 400 duplicate_slip as valid response
								if (
									error.response?.status === 400 &&
									error.response?.data?.message === 'duplicate_slip'
								) {
									// Handle duplicate slip response with dual output
									if (resource === 'bankSlip' && hasFilters(additionalOptions)) {
										if (matchesFilters(error.response.data, additionalOptions, i)) {
											matchedData.push({
												json: error.response.data,
												pairedItem: { item: i },
											});
										} else {
											debugLog(
												'Filter does not match - routing duplicate slip to second output',
												undefined,
												i,
											);
											filteredData.push({
												json: error.response.data,
												pairedItem: { item: i },
											});
										}
									} else {
										// No filters applied, use single output
										matchedData.push({
											json: error.response.data,
											pairedItem: { item: i },
										});
									}
								} else {
									throw error;
								}
							}
							continue;

						case 'verifyByBase64':
							const checkDuplicateBase64 = this.getNodeParameter('checkDuplicate', i) as boolean;
							const imageData = this.getNodeParameter('imageData', i) as string;

							const base64RequestData = {
								image: imageData,
								checkDuplicate: checkDuplicateBase64,
							};

							const base64Credentials = await this.getCredentials('easySlipApi');

							try {
								const base64Response = await this.helpers.httpRequest({
									method: 'POST',
									url: 'https://developer.easyslip.com/api/v1/verify',
									headers: {
										'Content-Type': 'application/json',
										Authorization: `Bearer ${base64Credentials.accessToken}`,
									},
									body: JSON.stringify(base64RequestData),
								});

								// Check if filters are applied and handle dual output
								if (resource === 'bankSlip' && hasFilters(additionalOptions)) {
									if (matchesFilters(base64Response, additionalOptions, i)) {
										matchedData.push({
											json: base64Response,
											pairedItem: { item: i },
										});
									} else {
										debugLog('Filter does not match - routing to second output', undefined, i);
										filteredData.push({
											json: base64Response,
											pairedItem: { item: i },
										});
									}
								} else {
									// No filters applied, use single output
									matchedData.push({
										json: base64Response,
										pairedItem: { item: i },
									});
								}
							} catch (error: any) {
								// Handle 400 duplicate_slip as valid response
								if (
									error.response?.status === 400 &&
									error.response?.data?.message === 'duplicate_slip'
								) {
									// Handle duplicate slip response with dual output
									if (resource === 'bankSlip' && hasFilters(additionalOptions)) {
										if (matchesFilters(error.response.data, additionalOptions, i)) {
											matchedData.push({
												json: error.response.data,
												pairedItem: { item: i },
											});
										} else {
											debugLog(
												'Filter does not match - routing duplicate slip to second output',
												undefined,
												i,
											);
											filteredData.push({
												json: error.response.data,
												pairedItem: { item: i },
											});
										}
									} else {
										// No filters applied, use single output
										matchedData.push({
											json: error.response.data,
											pairedItem: { item: i },
										});
									}
								} else {
									throw error;
								}
							}
							continue;

						case 'verifyByUrl':
							const checkDuplicateUrl = this.getNodeParameter('checkDuplicate', i) as boolean;
							const imageUrl = this.getNodeParameter('imageUrl', i) as string;

							const urlRequestData = {
								url: imageUrl,
								checkDuplicate: checkDuplicateUrl,
							};

							const urlCredentials = await this.getCredentials('easySlipApi');

							try {
								const urlResponse = await this.helpers.httpRequest({
									method: 'POST',
									url: 'https://developer.easyslip.com/api/v1/verify',
									headers: {
										'Content-Type': 'application/json',
										Authorization: `Bearer ${urlCredentials.accessToken}`,
									},
									body: JSON.stringify(urlRequestData),
								});

								// Check if filters are applied and handle dual output
								if (resource === 'bankSlip' && hasFilters(additionalOptions)) {
									if (matchesFilters(urlResponse, additionalOptions, i)) {
										matchedData.push({
											json: urlResponse,
											pairedItem: { item: i },
										});
									} else {
										debugLog('Filter does not match - routing to second output', undefined, i);
										filteredData.push({
											json: urlResponse,
											pairedItem: { item: i },
										});
									}
								} else {
									// No filters applied, use single output
									matchedData.push({
										json: urlResponse,
										pairedItem: { item: i },
									});
								}
							} catch (error: any) {
								// Handle 400 duplicate_slip as valid response
								if (
									error.response?.status === 400 &&
									error.response?.data?.message === 'duplicate_slip'
								) {
									// Handle duplicate slip response with dual output
									if (resource === 'bankSlip' && hasFilters(additionalOptions)) {
										if (matchesFilters(error.response.data, additionalOptions, i)) {
											matchedData.push({
												json: error.response.data,
												pairedItem: { item: i },
											});
										} else {
											debugLog(
												'Filter does not match - routing duplicate slip to second output',
												undefined,
												i,
											);
											filteredData.push({
												json: error.response.data,
												pairedItem: { item: i },
											});
										}
									} else {
										// No filters applied, use single output
										matchedData.push({
											json: error.response.data,
											pairedItem: { item: i },
										});
									}
								} else {
									throw error;
								}
							}
							continue;

						case 'verifyByImage':
							const imageBinaryProperty = this.getNodeParameter('imageBinaryProperty', i) as string;
							const checkDuplicateImage = this.getNodeParameter('checkDuplicate', i) as boolean;
							const binaryData = items[i].binary?.[imageBinaryProperty];

							if (!binaryData) {
								throw new NodeOperationError(
									this.getNode(),
									`No binary data found in property "${imageBinaryProperty}"`,
									{ itemIndex: i },
								);
							}

							const imageBuffer = await this.helpers.getBinaryDataBuffer(i, imageBinaryProperty);

							// Use manual HTTP request with form-data
							const form = new FormData();
							form.append('file', imageBuffer, {
								filename: binaryData.fileName || 'slip.jpg',
								contentType: binaryData.mimeType || 'image/jpeg',
							});
							form.append('checkDuplicate', checkDuplicateImage.toString());

							const imageCredentials = await this.getCredentials('easySlipApi');

							try {
								const imageResponse = await this.helpers.httpRequest({
									method: 'POST',
									url: 'https://developer.easyslip.com/api/v1/verify',
									body: form,
									headers: {
										Authorization: `Bearer ${imageCredentials.accessToken}`,
										...form.getHeaders(),
									},
								});

								// Check if filters are applied and handle dual output
								if (resource === 'bankSlip' && hasFilters(additionalOptions)) {
									if (matchesFilters(imageResponse, additionalOptions, i)) {
										matchedData.push({
											json: imageResponse,
											pairedItem: { item: i },
										});
									} else {
										debugLog('Filter does not match - routing to second output', undefined, i);
										filteredData.push({
											json: imageResponse,
											pairedItem: { item: i },
										});
									}
								} else {
									// No filters applied, use single output
									matchedData.push({
										json: imageResponse,
										pairedItem: { item: i },
									});
								}
							} catch (error: any) {
								// Handle 400 duplicate_slip as valid response
								if (
									error.response?.status === 400 &&
									error.response?.data?.message === 'duplicate_slip'
								) {
									// Handle duplicate slip response with dual output
									if (resource === 'bankSlip' && hasFilters(additionalOptions)) {
										if (matchesFilters(error.response.data, additionalOptions, i)) {
											matchedData.push({
												json: error.response.data,
												pairedItem: { item: i },
											});
										} else {
											debugLog(
												'Filter does not match - routing duplicate slip to second output',
												undefined,
												i,
											);
											filteredData.push({
												json: error.response.data,
												pairedItem: { item: i },
											});
										}
									} else {
										// No filters applied, use single output
										matchedData.push({
											json: error.response.data,
											pairedItem: { item: i },
										});
									}
								} else {
									throw error;
								}
							}
							continue;
					}
				} else if (resource === 'truemoneyWallet') {
					if (operation === 'verifyByImage') {
						const imageBinaryProperty = this.getNodeParameter('imageBinaryProperty', i) as string;
						const checkDuplicateWallet = this.getNodeParameter('checkDuplicate', i) as boolean;
						const binaryData = items[i].binary?.[imageBinaryProperty];

						debugLog('Truemoney Wallet verification started');
						debugLog('Image binary property:', imageBinaryProperty);
						debugLog('Check duplicate:', checkDuplicateWallet);
						debugLog('Binary data exists:', !!binaryData);

						if (!binaryData) {
							throw new NodeOperationError(
								this.getNode(),
								`No binary data found in property "${imageBinaryProperty}"`,
								{ itemIndex: i },
							);
						}

						const imageBuffer = await this.helpers.getBinaryDataBuffer(i, imageBinaryProperty);
						debugLog('Image buffer size:', imageBuffer.length);

						// Use manual HTTP request with form-data following the API docs
						const form = new FormData();
						form.append('file', imageBuffer, {
							filename: binaryData.fileName || 'slip.jpg',
							contentType: binaryData.mimeType || 'image/jpeg',
						});
						if (checkDuplicateWallet) {
							form.append('checkDuplicate', checkDuplicateWallet.toString());
						}

						const walletCredentials = await this.getCredentials('easySlipApi');
						debugLog('Making request to Truemoney Wallet API...');

						try {
							const walletResponse = await this.helpers.httpRequest({
								method: 'POST',
								url: 'https://developer.easyslip.com/api/v1/verify/truewallet',
								body: form,
								headers: {
									Authorization: `Bearer ${walletCredentials.accessToken}`,
									...form.getHeaders(),
								},
							});

							debugLog('Truemoney Wallet API response:', walletResponse);
							// TrueMoney wallet always goes to matched output (no filtering)
							matchedData.push({
								json: walletResponse,
								pairedItem: { item: i },
							});
						} catch (error: any) {
							debugLog('Truemoney Wallet API error:', {
								status: error.response?.status,
								data: error.response?.data,
							});
							// Handle 400 duplicate_slip as valid response
							if (
								error.response?.status === 400 &&
								error.response?.data?.message === 'duplicate_slip'
							) {
								debugLog('Handling duplicate_slip error as valid response');
								// TrueMoney wallet always goes to matched output (no filtering)
								matchedData.push({
									json: error.response.data,
									pairedItem: { item: i },
								});
							} else {
								debugLog('Throwing error:', error.message);
								throw error;
							}
						}
						continue;
					}
				}
			} catch (error) {
				if (this.continueOnFail()) {
					// Errors go to matched output (first output)
					matchedData.push({
						json: { error: error.message },
						pairedItem: { item: i },
					});
				} else {
					if (error.context) {
						error.context.itemIndex = i;
						throw error;
					}
					throw new NodeOperationError(this.getNode(), error, {
						itemIndex: i,
					});
				}
			}
		}

		// Always return dual outputs - second output is empty when no filters are applied
		if (hasAnyFilters) {
			debugLog(
				`Execution completed - Matched: ${matchedData.length}, Not Matched: ${filteredData.length}`,
			);
		} else {
			debugLog(`Execution completed - Total items: ${matchedData.length}, No filters applied`);
		}
		return [matchedData, filteredData];
	}
}
