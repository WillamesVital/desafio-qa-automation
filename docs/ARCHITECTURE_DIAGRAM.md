# Project Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                    desafio-qa-automation                             │
│                  Playwright Test Automation Project                  │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                          CI/CD Layer                                 │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │  GitHub Actions (.github/workflows/playwright.yml)          │    │
│  │  ┌──────────────────┐    ┌──────────────────────────┐     │    │
│  │  │  Job: api-tests  │ => │  Job: web-tests          │     │    │
│  │  │  - Run API tests │    │  - Run Web tests         │     │    │
│  │  │  - Upload report │    │  - Multi-browser         │     │    │
│  │  └──────────────────┘    │  - Upload report         │     │    │
│  │                           └──────────────────────────┘     │    │
│  └────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                        Configuration Layer                           │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │  playwright.config.js                                       │    │
│  │  - Projects: api, chromium, firefox, webkit                │    │
│  │  - Timeouts: 30s test, 10s action, 20s navigation          │    │
│  │  - Retries: CI=2, Local=1                                  │    │
│  │  - Reporters: HTML, List                                   │    │
│  └────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                          Test Layer                                  │
│  ┌──────────────────────┐       ┌───────────────────────────┐      │
│  │   API Tests          │       │   Web Tests               │      │
│  │   (tests/api/)       │       │   (tests/web/)            │      │
│  │                      │       │                           │      │
│  │  ┌────────────────┐  │       │  ┌─────────────────────┐ │      │
│  │  │ Positive Flow  │  │       │  │ practice-form.spec  │ │      │
│  │  │ - Create user  │  │       │  │ - Fill & submit     │ │      │
│  │  │ - Gen token    │  │       │  └─────────────────────┘ │      │
│  │  │ - Authorize    │  │       │                           │      │
│  │  │ - List books   │  │       │  ┌─────────────────────┐ │      │
│  │  │ - Add books    │  │       │  │ web-tables.spec     │ │      │
│  │  │ - Verify       │  │       │  │ - CRUD operations   │ │      │
│  │  └────────────────┘  │       │  └─────────────────────┘ │      │
│  │                      │       │                           │      │
│  │  ┌────────────────┐  │       │  ┌─────────────────────┐ │      │
│  │  │ Negative Flow  │  │       │  │ progress-bar.spec   │ │      │
│  │  │ - Weak pwd     │  │       │  │ - Start/Stop/Reset  │ │      │
│  │  │ - Invalid cred │  │       │  └─────────────────────┘ │      │
│  │  │ - Bad ISBN     │  │       │                           │      │
│  │  └────────────────┘  │       │  ┌─────────────────────┐ │      │
│  └──────────────────────┘       │  │ sortable.spec       │ │      │
│            ↓                     │  │ - Drag & drop       │ │      │
│  ┌──────────────────────┐       │  └─────────────────────┘ │      │
│  │ Uses: AccountClient  │       │                           │      │
│  │       BookStoreClient│       │  ┌─────────────────────┐ │      │
│  └──────────────────────┘       │  │ browser-windows     │ │      │
│                                  │  │ - Popup handling    │ │      │
│                                  │  └─────────────────────┘ │      │
│                                  └───────────────────────────┘      │
│                                              ↓                       │
│                                  ┌───────────────────────────┐      │
│                                  │ Uses: Page Objects (POM)  │      │
│                                  └───────────────────────────┘      │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                      Page Object Model (POM)                        │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │  pages/                                                     │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌────────────────┐  │    │
│  │  │  HomePage    │  │ Forms/       │  │ Elements/      │  │    │
│  │  │  - goto()    │  │ PracticeForm │  │ WebTablesPage  │  │    │
│  │  │  - openForms │  │ - fillForm() │  │ - addRecord()  │  │    │
│  │  │  - openElems │  │ - submit()   │  │ - editRecord() │  │    │
│  │  └──────────────┘  │ - closePopup │  │ - deleteRecord │  │    │
│  │                    └──────────────┘  └────────────────┘  │    │
│  │                                                           │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌────────────────┐  │    │
│  │  │ Widgets/     │  │ Interactions │  │ Windows/       │  │    │
│  │  │ ProgressBar  │  │ SortablePage │  │ BrowserWindows │  │    │
│  │  │ - start()    │  │ - sortAsc()  │  │ - openNew()    │  │    │
│  │  │ - stop()     │  │ - shuffle()  │  │ - validate()   │  │    │
│  │  │ - reset()    │  │ - dragTo()   │  │ - close()      │  │    │
│  │  └──────────────┘  └──────────────┘  └────────────────┘  │    │
│  └────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                         Helper Layer                                 │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │  helpers/                                                   │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌────────────────┐  │    │
│  │  │ apiClient.js │  │ dataFactory  │  │ webUtils.js    │  │    │
│  │  │              │  │              │  │                │  │    │
│  │  │ AccountClient│  │ genUsername()│  │ setupAdBlock() │  │    │
│  │  │ - createUser │  │ genPassword()│  │ robustGoto()   │  │    │
│  │  │ - genToken   │  │ genEmail()   │  │                │  │    │
│  │  │ - authorize  │  │ genMobile()  │  │ Features:      │  │    │
│  │  │ - deleteUser │  │ genAddress() │  │ - Retry logic  │  │    │
│  │  │              │  │              │  │ - 502 detect   │  │    │
│  │  │ BookStore    │  │ genFirst()   │  │ - Ad blocking  │  │    │
│  │  │ - listBooks  │  │ genLast()    │  │                │  │    │
│  │  │ - addBooks   │  │              │  │                │  │    │
│  │  └──────────────┘  └──────────────┘  └────────────────┘  │    │
│  │                                                           │    │
│  │  ┌──────────────────────────────────────────────────┐    │    │
│  │  │ config.js                                        │    │    │
│  │  │ - BASE_URLS (account, bookstore)                │    │    │
│  │  └──────────────────────────────────────────────────┘    │    │
│  └────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                       External Dependencies                          │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │  Target System: DemoQA (https://demoqa.com)                │    │
│  │  ┌──────────────────┐         ┌──────────────────────┐    │    │
│  │  │ API Endpoints    │         │ Web UI               │    │    │
│  │  │ /Account/v1/...  │         │ /automation-...      │    │    │
│  │  │ /BookStore/v1/...│         │ /webtables           │    │    │
│  │  └──────────────────┘         │ /sortable            │    │    │
│  │                                └──────────────────────┘    │    │
│  └────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                         Documentation                                │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │  docs/                                                      │    │
│  │  - README.md (340+ lines, comprehensive guide)             │    │
│  │  - ANALISE_PROJETO.md (detailed analysis, Portuguese)      │    │
│  │  - ANALYSIS_SUMMARY.md (executive summary, English)        │    │
│  │  - bugs/demoqa-sortable-preordered.md (bug report)         │    │
│  │    └── Evidence: image.png, evidencia.mp4                  │    │
│  └────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                       Key Patterns & Practices                       │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │  ✅ Page Object Model (POM)                                │    │
│  │  ✅ Given/When/Then with test.step                         │    │
│  │  ✅ Separation of Concerns (helpers/pages/tests)           │    │
│  │  ✅ Data-driven testing (dataFactory)                      │    │
│  │  ✅ Resilience patterns (retry, robustGoto, adBlock)       │    │
│  │  ✅ Cleanup strategies (afterEach, afterAll)               │    │
│  │  ✅ CI/CD automation (GitHub Actions)                      │    │
│  │  ✅ Comprehensive documentation                            │    │
│  │  ✅ Bug reporting with evidence                            │    │
│  └────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘

Legend:
  ┌─────┐
  │     │  Component/Layer
  └─────┘
  
     ↓     Flow/Dependency
    
   =>      Sequential dependency (CI jobs)

```

## Data Flow Examples

### API Test Flow
```
Test File (spec.js)
    ↓
Uses AccountClient & BookStoreClient (helpers/apiClient.js)
    ↓
Makes HTTP requests to DemoQA API
    ↓
Validates responses with expect()
    ↓
Attaches evidence if failure
    ↓
Cleanup: deletes test user
```

### Web Test Flow
```
Test File (spec.js)
    ↓
Creates Page Object instances (e.g., HomePage, PracticeFormPage)
    ↓
Page Objects use webUtils (setupAdBlock, robustGoto)
    ↓
Page Objects interact with DemoQA UI
    ↓
Test validates UI state with expect()
    ↓
Screenshots/videos captured on failure
```

### Resilience Flow
```
Test navigates to page
    ↓
setupAdBlock() blocks ads/trackers
    ↓
robustGoto() attempts navigation
    ↓
If 502 Bad Gateway detected:
  ├─ Retry with exponential backoff
  ├─ Check page content for error text
  └─ Max 5 attempts
    ↓
Success: test continues
Failure: attach evidence and fail
```

## Component Interactions

```
┌──────────────┐
│   Test File  │
└──────┬───────┘
       │ imports
       ├─────────────────┐
       │                 │
       ↓                 ↓
┌──────────────┐  ┌──────────────┐
│  Page Object │  │   Helper     │
└──────┬───────┘  └──────┬───────┘
       │                 │
       │ uses            │ uses
       └────────┬────────┘
                ↓
         ┌──────────────┐
         │   Playwright │
         │   Browser    │
         └──────┬───────┘
                ↓
         ┌──────────────┐
         │   DemoQA     │
         │   (Target)   │
         └──────────────┘
```
