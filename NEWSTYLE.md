:root {
  /* Paleta principal */
  --color-bg: #ffffff;
  --color-bg-soft: #f7f8f4;
  --color-primary: #9aaa8e;      /* verde sálvia */
  --color-primary-dark: #748366;
  --color-primary-light: #dce3d4;

  /* Textos */
  --color-text: #3f443b;
  --color-text-muted: #8a8f82;
  --color-border: #e5e9df;

  /* Estados */
  --color-success: #8fa982;
  --color-warning: #c8b47b;
  --color-danger: #b97878;

  /* Tipografia */
  --font-title: "Cormorant Garamond", "Playfair Display", serif;
  --font-body: "Montserrat", "Inter", sans-serif;
  --font-script: "Allura", "Great Vibes", cursive;

  /* Layout */
  --radius-sm: 8px;
  --radius-md: 14px;
  --radius-lg: 24px;

  --shadow-soft: 0 8px 30px rgba(116, 131, 102, 0.12);
}

/* Reset base */
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  background: var(--color-bg);
  color: var(--color-text);
  font-family: var(--font-body);
  font-weight: 300;
  letter-spacing: 0.03em;
}

/* Títulos */
h1, h2, h3 {
  font-family: var(--font-title);
  color: var(--color-primary-dark);
  font-weight: 300;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

h1 {
  font-size: 48px;
}

h2 {
  font-size: 32px;
}

h3 {
  font-size: 22px;
}

/* Texto comum */
p {
  color: var(--color-text-muted);
  line-height: 1.8;
  font-size: 15px;
}

/* Texto cursivo decorativo */
.text-script {
  font-family: var(--font-script);
  color: var(--color-primary);
  font-size: 36px;
  letter-spacing: 0.02em;
  font-weight: 300;
}

/* Container */
.container {
  width: 100%;
  max-width: 1180px;
  margin: 0 auto;
  padding: 32px;
}

/* Cards */
.card {
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 28px;
  box-shadow: var(--shadow-soft);
}

/* Botões */
.button {
  border: none;
  border-radius: 999px;
  padding: 13px 28px;
  background: var(--color-primary);
  color: white;
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 400;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.25s ease;
}

.button:hover {
  background: var(--color-primary-dark);
  transform: translateY(-1px);
}

.button-outline {
  background: transparent;
  color: var(--color-primary-dark);
  border: 1px solid var(--color-primary);
}

/* Inputs */
input,
textarea,
select {
  width: 100%;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 14px 16px;
  background: var(--color-bg-soft);
  color: var(--color-text);
  font-family: var(--font-body);
  font-size: 14px;
  outline: none;
  transition: all 0.2s ease;
}

input:focus,
textarea:focus,
select:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(154, 170, 142, 0.18);
}

/* Labels */
label {
  display: block;
  margin-bottom: 8px;
  color: var(--color-primary-dark);
  font-size: 12px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

/* Header */
.app-header {
  background: var(--color-bg);
  border-bottom: 1px solid var(--color-border);
  padding: 22px 32px;
}

.logo {
  font-family: var(--font-title);
  color: var(--color-primary-dark);
  font-size: 38px;
  font-weight: 300;
  letter-spacing: -0.04em;
}

/* Sidebar */
.sidebar {
  background: var(--color-bg-soft);
  border-right: 1px solid var(--color-border);
  padding: 24px;
}

.sidebar a {
  display: block;
  padding: 12px 16px;
  border-radius: var(--radius-md);
  color: var(--color-text-muted);
  text-decoration: none;
  font-size: 13px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.sidebar a:hover,
.sidebar a.active {
  background: var(--color-primary-light);
  color: var(--color-primary-dark);
}

/* Tabelas */
table {
  width: 100%;
  border-collapse: collapse;
  background: var(--color-bg);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

th {
  background: var(--color-bg-soft);
  color: var(--color-primary-dark);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-weight: 400;
}

td,
th {
  padding: 16px;
  border-bottom: 1px solid var(--color-border);
}

td {
  color: var(--color-text-muted);
  font-size: 14px;
}

/* Badges */
.badge {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 999px;
  background: var(--color-primary-light);
  color: var(--color-primary-dark);
  font-size: 11px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

/* Divisores decorativos */
.divider-leaf {
  width: 80px;
  height: 1px;
  background: var(--color-primary);
  opacity: 0.5;
  margin: 24px 0;
}



<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400&family=Montserrat:wght@300;400;500&family=Allura&display=swap" rel="stylesheet">