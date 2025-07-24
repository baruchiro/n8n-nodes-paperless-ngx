# n8n-nodes-paperless-ngx

This is an n8n community node. It lets you use Paperless-ngx in your n8n workflows.

Paperless-ngx is a document management system that allows you to scan, archive, and organize your documents with OCR capabilities.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

[Installation](#installation)  
[Development](#development)  
[Operations](#operations)  
[Credentials](#credentials)  
[Compatibility](#compatibility)  
[Usage](#usage)  
[Resources](#resources)  

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

## Development

You can test your node as you build it by running it in a local n8n instance.

### Prerequisites

1. Install n8n using npm:
   ```bash
   npm install n8n -g
   ```

### Testing Your Node Locally

1. When you are ready to test your node, publish it locally:
   ```bash
   # In your node directory
   npm run build
   npm link
   ```

2. Install the node into your local n8n instance:
   ```bash
   # In the nodes directory within your n8n installation
   # node-package-name is the name from the package.json
   npm link <node-package-name>
   ```
   
   **Check your directory**: Make sure you run `npm link <node-name>` in the nodes directory within your n8n installation. This can be:
   - `~/.n8n/custom/`
   - `~/.n8n/<your-custom-name>`: if your n8n installation set a different name using `N8N_CUSTOM_EXTENSIONS`.

3. Start n8n:
   ```bash
   n8n start
   ```

4. Open n8n in your browser. You should see your nodes when you search for them in the nodes panel.

**Node names**: Make sure you search using the node name, not the package name. For example, if your npm package name is `n8n-nodes-paperless-ngx`, and the package contains nodes named `get-documents-by-tags`, `get-all-documents`, `get-all-tags`, you should search for `get-documents-by-tags`, not `paperless-ngx`.

### Troubleshooting

For troubleshooting issues with running nodes locally, see the [n8n documentation on running nodes locally](https://docs.n8n.io/integrations/creating-nodes/test/run-node-locally/).

## Operations

### Paperless Documents Node
- **Get Documents by Tags** - Retrieve documents filtered by specific tags
- **Get All Documents** - Retrieve all documents with pagination and ordering

### Paperless Tags Node
- **Get All Tags** - Retrieve all tags with pagination and ordering
- **Get Tag by ID** - Retrieve a specific tag by its ID

### Paperless Document Details Node
- **Get Document by ID** - Retrieve detailed information about a specific document
- **Get Document Metadata** - Retrieve metadata for a specific document
- **Get Document History** - Retrieve history for a specific document

## Credentials

To use this node, you need to authenticate with your Paperless-ngx instance:

1. **Base URL** - The URL of your Paperless-ngx instance (e.g., `http://192.168.1.105`)
2. **Token** - Your authentication token from Paperless-ngx
3. **Port** (optional) - Custom port if different from default HTTP/HTTPS ports

### Getting Your Token

1. Log into your Paperless-ngx instance
2. Go to your user profile
3. Generate an authentication token
4. Copy the token and use it in the credentials

## Compatibility

- **n8n version**: 1.0.0 or later
- **Paperless-ngx version**: 6.0.0 or later
- **Node.js version**: 20.15 or later

## Usage

### Basic Workflow Example

1. **Get Documents by Tags**
   - Use the "Paperless Documents" node
   - Select "Get Documents by Tags" operation
   - Enter tag names (comma-separated)
   - Configure pagination and ordering as needed

2. **Get Document Details**
   - Use the "Paperless Document Details" node
   - Select "Get Document by ID" operation
   - Enter the document ID
   - Retrieve detailed document information

3. **Get Available Tags**
   - Use the "Paperless Tags" node
   - Select "Get All Tags" operation
   - Browse available tags in your Paperless-ngx instance

### Advanced Workflow Example

```
Start → Paperless Tags (Get All Tags) → Paperless Documents (Get Documents by Tags) → Paperless Document Details (Get Document by ID)
```

This workflow:
1. Gets all available tags
2. Uses those tags to filter documents
3. Gets detailed information for each document

## Resources

* [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
* [Paperless-ngx API documentation](https://docs.paperless-ngx.com/api/)
* [Paperless-ngx project](https://github.com/paperless-ngx/paperless-ngx)

## License

[MIT](LICENSE.md)
