# Changelog

## [1.0.0] - 2025-07-19

### Added

#### Core Features
- **Bank Slip Verification**: Complete implementation with 4 verification methods
  - Verify by Payload (QR code data) - GET request with query parameters
  - Verify by Image - POST with multipart form data
  - Verify by Base64 - POST with JSON payload
  - Verify by URL - POST with JSON payload
- **TrueMoney Wallet Verification**: Image-based verification for digital wallet slips
- **Dual Output System**: Smart routing with "Matched/All" and "Not Matched" outputs

#### Node Configuration
- **Resource Selection**: Bank Slip and TrueMoney Wallet options
- **Operation Selection**: Context-aware operations based on selected resource
- **Duplicate Detection**: Configurable `checkDuplicate` option for all verification methods
- **Binary Property Configuration**: Customizable property name for image data (default: 'data')

#### Filtering Capabilities (Bank Slip Only)
- **Receiver Bank Code Filter**: Dropdown selection of all major Thai banks (20+ banks)
  - Automatic 3-digit code formatting (e.g., 004, 025, 014)
  - Non-matching items route to second output
- **Receiver Name Filter**: Partial text matching with case-insensitive search
  - Non-matching items route to second output
- **Combined Filtering**: Support for multiple filter criteria simultaneously

#### Error Handling & Debugging
- **Duplicate Slip Handling**: 400 `duplicate_slip` responses treated as valid data
- **Continue on Fail**: Errors route to first output when enabled
- **Debug Logging**: Comprehensive console logging with `enableDebugLogging` option
  - Request/response logging
  - Filter matching details
  - Execution flow tracking
  - Performance metrics
- **Binary Data Validation**: Clear error messages for missing image properties

#### API Integration
- **EasySlip API Credentials**: Secure Bearer token authentication
- **Multiple Endpoints**: 
  - `/api/v1/verify` for bank slips
  - `/api/v1/verify/truewallet` for TrueMoney wallet
- **FormData Support**: Proper multipart uploads using `form-data` package
- **Request Optimization**: Different HTTP methods based on verification type

#### Developer Experience
- **TypeScript Implementation**: Full type safety with n8n-workflow types
- **ESLint Configuration**: Comprehensive linting with n8n-specific rules
- **Build System**: Gulp-based icon copying and TypeScript compilation
- **AI Agent Compatibility**: `usableAsTool: true` for AI workflow integration


### Bank Support

#### Supported Thai Banks (20+ institutions)
- Bangkok Bank (BBL) - 002
- Krung Thai Bank (KTB) - 006
- Bank of Ayudhya (BAY) - 025
- Kasikorn Bank (KBANK) - 004
- Kiatnakin Phatra Bank (KKP) - 069
- CIMB Thai Bank (CIMBT) - 022
- TMBThanachart Bank (TTB) - 011
- Tisco Bank (TISCO) - 067
- Thai Credit Retail Bank (TCD) - 071
- Siam Commercial Bank (SCB) - 014
- Bank for Agriculture and Agricultural Cooperatives (BAAC) - 034
- Export-Import Bank of Thailand (EXIM) - 035
- United Overseas Bank (UOBT) - 024
- Land and Houses Bank (LHFG) - 073
- Government Savings Bank (GSB) - 030
- Government Housing Bank (GHB) - 033
- Industrial and Commercial Bank of China (Thai) (ICBCT) - 070
- Small and Medium Enterprise Development Bank of Thailand (SME) - 098

### Security
- **Credential Protection**: Secure token storage with password field type
- **Input Validation**: Proper sanitization of user inputs
- **Error Masking**: Sensitive information excluded from error messages

---

## Future Roadmap

### Planned Features (v1.1.0)
- **Batch Processing**: Multiple slip verification in single operation
- **Webhook Support**: Real-time slip verification callbacks
- **Extended Filtering**: Amount range and date range filters
- **Cache Management**: Response caching for improved performance

### Under Consideration (v1.2.0)
- **QR Code Generation**: Generate verification QR codes
- **Export Capabilities**: CSV/Excel export of verification results
- **Analytics Dashboard**: Built-in verification statistics
- **Multi-language Support**: Thai and English response localization

---

## Support & Contribution

- **Issues**: Report bugs and feature requests on [GitHub Issues](https://github.com/M4h45amu7x/n8n-nodes-easyslip/issues)
- **Documentation**: [EasySlip API Documentation](https://document.easyslip.com/documents/start)
- **Community**: [n8n Community Forum](https://community.n8n.io/)

---

**Note**: This changelog follows [Semantic Versioning](https://semver.org/). Version numbers indicate:
- **MAJOR**: Incompatible API changes
- **MINOR**: Backwards-compatible functionality additions  
- **PATCH**: Backwards-compatible bug fixes
