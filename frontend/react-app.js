(function () {
    const e = React.createElement;

    const DEFAULT_INTEGRATION_OPTIONS = {
        setores: [
            "Produção",
            "Controle de estoque",
            "Expedição",
            "Qualidade",
            "Recebimento",
            "SME"
        ],
        cargos: ["Operador 1", "Operador 2", "Operador 3"],
        turnos: ["1° Turno", "2° Turno"],
        integracoes: ["Sim", "Não"]
    };

    const DEFAULT_OCCURRENCE_OPTIONS = {
        turnos: ["1° Turno", "2° Turno", "3° Turno"],
        graus: [
            "0 - Muito baixo",
            "1 - Baixo",
            "2 - Baixo moderado",
            "3 - Atenção",
            "4 - Relevante",
            "5 - Moderado",
            "6 - Significativo",
            "7 - Alto",
            "8 - Muito alto",
            "9 - Crítico",
            "10 - Muito grave"
        ]
    };

    const THEMES = [
        {
            id: "default",
            label: "Modo Padrão",
            className: "",
            preview: ["#4c6ef5", "#86b3ff"]
        },
        {
            id: "dusk",
            label: "Modo Dusk",
            className: "theme-dusk",
            preview: ["#5468ff", "#8997ff"]
        },
        {
            id: "aurora",
            label: "Modo Aurora",
            className: "theme-aurora",
            preview: ["#5fd3ff", "#9ee8ff"]
        },
        {
            id: "rainforest",
            label: "Modo Rainforest",
            className: "theme-rainforest",
            preview: ["#3fa96f", "#73d4a1"]
        },
        {
            id: "ember",
            label: "Modo Ember",
            className: "theme-ember",
            preview: ["#ff784f", "#ff9b6a"]
        },
        {
            id: "monochrome",
            label: "Modo Monocromático",
            className: "theme-monochrome",
            preview: ["#111827", "#4b5563"]
        },
        {
            id: "candy",
            label: "Modo Candy",
            className: "theme-candy",
            preview: ["#ff7eb6", "#ffb3d8"]
        },
        {
            id: "inferno",
            label: "Modo Inferno",
            className: "theme-inferno",
            preview: ["#ff4d36", "#ff7a45"]
        },
        {
            id: "eclipse",
            label: "Modo Eclipse",
            className: "theme-eclipse",
            preview: ["#8c6cf8", "#ff6bd6"]
        },
        {
            id: "abyss",
            label: "Modo Abismo",
            className: "theme-abyss",
            preview: ["#34c6ff", "#2fd4a5"]
        },
        {
            id: "reptile",
            label: "Modo Reptile",
            className: "theme-reptile",
            preview: ["#45d97c", "#20995b"]
        }
    ];

    const sanitizeList = function (items, fallback) {
        const fallbackArray = Array.isArray(fallback) ? fallback : [];

        const materialized = (function () {
            if (Array.isArray(items)) {
                return items;
            }

            if (typeof items === "string") {
                return items.split(/[\r\n,]+/);
            }

            if (items && typeof items[Symbol.iterator] === "function") {
                return Array.from(items);
            }

            return fallbackArray;
        })();

        const cleaned = materialized
            .map(function (entry) {
                return String(entry || "").trim();
            })
            .filter(function (entry) {
                return entry.length > 0;
            });

        return cleaned.length ? cleaned : fallbackArray.slice();
    };

    const parseDegreeOptions = function (items) {
        if (!Array.isArray(items)) {
            return [];
        }

        return items.map(function (entry, index) {
            const label = String(entry || "").trim();
            if (!label) {
                return { value: String(index), label: "" };
            }

            const separatorIndex = label.indexOf("-");
            if (separatorIndex === -1) {
                return { value: label, label: label };
            }

            const value = label.slice(0, separatorIndex).trim();
            return { value: value || String(index), label: label };
        });
    };

    const normalizeIntegrationOptions = function (options) {
        const source = options || {};
        return {
            setores: sanitizeList(source.setores, DEFAULT_INTEGRATION_OPTIONS.setores),
            cargos: sanitizeList(source.cargos, DEFAULT_INTEGRATION_OPTIONS.cargos),
            turnos: sanitizeList(source.turnos, DEFAULT_INTEGRATION_OPTIONS.turnos),
            integracoes: sanitizeList(source.integracoes, DEFAULT_INTEGRATION_OPTIONS.integracoes)
        };
    };

    const normalizeOccurrenceOptions = function (options) {
        const source = options || {};
        return {
            turnos: sanitizeList(source.turnos, DEFAULT_OCCURRENCE_OPTIONS.turnos),
            graus: sanitizeList(source.graus, DEFAULT_OCCURRENCE_OPTIONS.graus)
        };
    };

    const ensureFromList = function (value, list) {
        if (!Array.isArray(list) || !list.length) {
            return "";
        }
        return list.indexOf(value) !== -1 ? value : list[0];
    };

    const THEME_STORAGE_KEY = "projetoDiego.theme";
    const THEME_CLASS_LIST = THEMES
        .map(function (theme) {
            return theme.className;
        })
        .filter(function (className) {
            return Boolean(className);
        });
    const VIEW_STORAGE_KEY = "projetoDiego.activeView";
    const TABLE_DEFAULT_DATASET = "integration";
    const TableViewComponent = (function () {
        if (window.AppTableView && typeof window.AppTableView.Component === "function") {
            return window.AppTableView.Component;
        }
        console.warn(
            "Componente de tabela não encontrado. Garanta que 'table-view.js' seja carregado antes de 'react-app.js'."
        );
        return null;
    })();
    const VIEW_CONFIG = {
        integration: {
            id: "integration",
            label: "Alimentação Integração",
            title: "Controle de integração de colaboradores Martins",
            description: "Cadastre novos colaboradores no sistema",
            primaryActionLabel: "Salvar registro",
            secondaryActionLabel: "Ir para tabela",
            note: "Todos os campos são obrigatórios"
        },
        occurrence: {
            id: "occurrence",
            label: "Alimentação Ocorrência",
            title: "Registro de ocorrências de colaboradores",
            description: "Relate divergências e incidentes para acompanhamento",
            primaryActionLabel: "Salvar ocorrência",
            secondaryActionLabel: "Consultar histórico",
            note: "Revise com atenção antes de registrar a ocorrência"
        },
        table: {
            id: "table",
            label: "Tabela operacional",
            title: "Tabela consolidada de integrações e ocorrências",
            description: "Visualize o histórico paginado com até 10 registros por página",
            primaryActionLabel: null,
            secondaryActionLabel: null,
            note: "Atualizações em tempo real após cada envio"
        },
        settings: {
            id: "settings",
            label: "Configurações",
            title: "Configuração das listas de referência",
            description: "Ajuste os valores usados nos formulários de integração e ocorrência",
            primaryActionLabel: "Guardar configurações",
            secondaryActionLabel: "Restaurar padrões",
            note: "As alterações são aplicadas somente após salvar"
        }
    };
    const VALID_VIEW_IDS = Object.keys(VIEW_CONFIG);

    const ICON_GLYPHS = {
        matricula: function () {
            return [
                e("rect", {
                    key: "outline",
                    x: 4.5,
                    y: 6,
                    width: 15,
                    height: 12,
                    rx: 2.5,
                    ry: 2.5,
                    fill: "none",
                    stroke: "currentColor",
                    strokeWidth: 1.6
                }),
                e("circle", {
                    key: "avatar",
                    cx: 9,
                    cy: 11,
                    r: 2.3,
                    fill: "none",
                    stroke: "currentColor",
                    strokeWidth: 1.6
                }),
                e("path", {
                    key: "line-top",
                    d: "M13.5 10.5h4.2",
                    fill: "none",
                    stroke: "currentColor",
                    strokeWidth: 1.6,
                    strokeLinecap: "round"
                }),
                e("path", {
                    key: "line-mid",
                    d: "M13.5 13h4.2",
                    fill: "none",
                    stroke: "currentColor",
                    strokeWidth: 1.6,
                    strokeLinecap: "round"
                }),
                e("path", {
                    key: "line-bottom",
                    d: "M8.2 15.5h9.5",
                    fill: "none",
                    stroke: "currentColor",
                    strokeWidth: 1.6,
                    strokeLinecap: "round"
                })
            ];
        },
        nome: function () {
            return [
                e("circle", {
                    key: "head",
                    cx: 12,
                    cy: 9.5,
                    r: 3.1,
                    fill: "none",
                    stroke: "currentColor",
                    strokeWidth: 1.7
                }),
                e("path", {
                    key: "shoulders",
                    d: "M6.8 17.8c0-2.7 2.7-4.2 5.2-4.2s5.2 1.5 5.2 4.2",
                    fill: "none",
                    stroke: "currentColor",
                    strokeWidth: 1.7,
                    strokeLinecap: "round",
                    strokeLinejoin: "round"
                })
            ];
        },
        setor: function () {
            return [
                e("path", {
                    key: "blocks",
                    d: "M6 18.5V8.2l3.8 2.1V8.2l4 2.1V6.3l4.2 2.6v9.6",
                    fill: "none",
                    stroke: "currentColor",
                    strokeWidth: 1.6,
                    strokeLinecap: "round",
                    strokeLinejoin: "round"
                }),
                e("path", {
                    key: "ground",
                    d: "M5.2 18.5h13.6",
                    fill: "none",
                    stroke: "currentColor",
                    strokeWidth: 1.6,
                    strokeLinecap: "round"
                }),
                e("path", {
                    key: "windows",
                    d: "M9.8 13v1.9m0-5.1V11m4 1.4v1.9m4-1.9v1.9",
                    fill: "none",
                    stroke: "currentColor",
                    strokeWidth: 1.4,
                    strokeLinecap: "round"
                })
            ];
        },
        cargo: function () {
            return [
                e("circle", {
                    key: "medal",
                    cx: 12,
                    cy: 11,
                    r: 4.3,
                    fill: "none",
                    stroke: "currentColor",
                    strokeWidth: 1.6
                }),
                e("path", {
                    key: "star",
                    d: "M12 8.9l1 1.9 2.1.3-1.6 1.5.4 2.1-1.9-1-1.9 1 .4-2.1-1.6-1.5 2.1-.3z",
                    fill: "currentColor",
                    stroke: "currentColor",
                    strokeWidth: 0.5,
                    strokeLinejoin: "round"
                }),
                e("path", {
                    key: "tails",
                    d: "M10.2 15.4l-1.6 3 2.2-.6 1.2 1.8 1.2-1.8 2.2.6-1.6-3",
                    fill: "none",
                    stroke: "currentColor",
                    strokeWidth: 1.2,
                    strokeLinejoin: "round"
                })
            ];
        },
        turno: function () {
            return [
                e("circle", {
                    key: "clock",
                    cx: 12,
                    cy: 12,
                    r: 5.6,
                    fill: "none",
                    stroke: "currentColor",
                    strokeWidth: 1.6
                }),
                e("path", {
                    key: "hand-hour",
                    d: "M12 8.5v3.1l2.2 1.5",
                    fill: "none",
                    stroke: "currentColor",
                    strokeWidth: 1.6,
                    strokeLinecap: "round",
                    strokeLinejoin: "round"
                }),
                e("path", {
                    key: "marker-top",
                    d: "M12 5.8v1.3",
                    fill: "none",
                    stroke: "currentColor",
                    strokeWidth: 1.4,
                    strokeLinecap: "round"
                })
            ];
        },
        integracao: function () {
            return [
                e("path", {
                    key: "bridge",
                    d: "M6.3 11.7l3-3a2.2 2.2 0 013.1 0l3 3",
                    fill: "none",
                    stroke: "currentColor",
                    strokeWidth: 1.6,
                    strokeLinecap: "round",
                    strokeLinejoin: "round"
                }),
                e("path", {
                    key: "palms",
                    d: "M6.9 15.2l3 3a1.9 1.9 0 002.7 0l3-3",
                    fill: "none",
                    stroke: "currentColor",
                    strokeWidth: 1.6,
                    strokeLinecap: "round",
                    strokeLinejoin: "round"
                }),
                e("path", {
                    key: "finger-a",
                    d: "M9.4 13.8l1.9 1.9",
                    fill: "none",
                    stroke: "currentColor",
                    strokeWidth: 1.4,
                    strokeLinecap: "round"
                }),
                e("path", {
                    key: "finger-b",
                    d: "M12 13.5l1.7 1.7",
                    fill: "none",
                    stroke: "currentColor",
                    strokeWidth: 1.4,
                    strokeLinecap: "round"
                })
            ];
        },
        supervisor: function () {
            return [
                e("path", {
                    key: "crown",
                    d: "M8.5 7l1.3 1.1L12 6.4l2.2 1.7L15.5 7l1.3 2.7H7.2z",
                    fill: "none",
                    stroke: "currentColor",
                    strokeWidth: 1.4,
                    strokeLinejoin: "round"
                }),
                e("circle", {
                    key: "head",
                    cx: 12,
                    cy: 11.2,
                    r: 2.6,
                    fill: "none",
                    stroke: "currentColor",
                    strokeWidth: 1.6
                }),
                e("path", {
                    key: "body",
                    d: "M7.3 17.8c0-2.4 2.3-3.7 4.7-3.7s4.7 1.3 4.7 3.7",
                    fill: "none",
                    stroke: "currentColor",
                    strokeWidth: 1.6,
                    strokeLinecap: "round",
                    strokeLinejoin: "round"
                })
            ];
        },
        data: function () {
            return [
                e("rect", {
                    key: "sheet",
                    x: 5.5,
                    y: 7,
                    width: 13,
                    height: 11.5,
                    rx: 2,
                    ry: 2,
                    fill: "none",
                    stroke: "currentColor",
                    strokeWidth: 1.6
                }),
                e("path", {
                    key: "header",
                    d: "M5.5 10.2h13",
                    fill: "none",
                    stroke: "currentColor",
                    strokeWidth: 1.6,
                    strokeLinecap: "round"
                }),
                e("path", {
                    key: "rings",
                    d: "M9.5 5.8v1.9m5-1.9v1.9",
                    fill: "none",
                    stroke: "currentColor",
                    strokeWidth: 1.6,
                    strokeLinecap: "round"
                }),
                e("circle", {
                    key: "event",
                    cx: 12,
                    cy: 14.2,
                    r: 1.6,
                    fill: "currentColor"
                })
            ];
        },
        observacao: function () {
            return [
                e("path", {
                    key: "bubble",
                    d: "M7 7h7.4a3 3 0 013 3v3.5a3 3 0 01-3 3H10l-3 2v-2.2a3 3 0 01-3-3V10a3 3 0 013-3",
                    fill: "none",
                    stroke: "currentColor",
                    strokeWidth: 1.6,
                    strokeLinecap: "round",
                    strokeLinejoin: "round"
                }),
                e("circle", {
                    key: "dot1",
                    cx: 9.6,
                    cy: 11.4,
                    r: 0.95,
                    fill: "currentColor"
                }),
                e("circle", {
                    key: "dot2",
                    cx: 12,
                    cy: 11.4,
                    r: 0.95,
                    fill: "currentColor"
                }),
                e("circle", {
                    key: "dot3",
                    cx: 14.4,
                    cy: 11.4,
                    r: 0.95,
                    fill: "currentColor"
                })
            ];
        },
        gravidade: function () {
            return [
                e("path", {
                    key: "triangle",
                    d: "M12 5.2l8.2 14.6H3.8z",
                    fill: "none",
                    stroke: "currentColor",
                    strokeWidth: 1.7,
                    strokeLinejoin: "round"
                }),
                e("path", {
                    key: "mark",
                    d: "M12 10.2v4.7",
                    fill: "none",
                    stroke: "currentColor",
                    strokeWidth: 1.6,
                    strokeLinecap: "round"
                }),
                e("circle", {
                    key: "dot",
                    cx: 12,
                    cy: 17.2,
                    r: 0.95,
                    fill: "currentColor"
                })
            ];
        },
        volumes: function () {
            return [
                e("rect", {
                    key: "top",
                    x: 6,
                    y: 6.2,
                    width: 12,
                    height: 4,
                    rx: 1.3,
                    ry: 1.3,
                    fill: "none",
                    stroke: "currentColor",
                    strokeWidth: 1.5
                }),
                e("rect", {
                    key: "middle",
                    x: 4.8,
                    y: 11,
                    width: 14.4,
                    height: 4.2,
                    rx: 1.4,
                    ry: 1.4,
                    fill: "none",
                    stroke: "currentColor",
                    strokeWidth: 1.5
                }),
                e("rect", {
                    key: "bottom",
                    x: 6,
                    y: 16,
                    width: 12,
                    height: 4,
                    rx: 1.3,
                    ry: 1.3,
                    fill: "none",
                    stroke: "currentColor",
                    strokeWidth: 1.5
                }),
                e("path", {
                    key: "details",
                    d: "M8.8 8.2h3.4m-3.4 4.8h6.4m-6.4 4.4h5.2",
                    fill: "none",
                    stroke: "currentColor",
                    strokeWidth: 1.2,
                    strokeLinecap: "round"
                })
            ];
        },
        default: function () {
            return [
                e("circle", {
                    key: "dot",
                    cx: 12,
                    cy: 12,
                    r: 5,
                    fill: "none",
                    stroke: "currentColor",
                    strokeWidth: 1.6
                })
            ];
        }
    };

    const renderFieldLabel = function (text, iconKey) {
        const glyphFactory = ICON_GLYPHS[iconKey] || ICON_GLYPHS.default;
        const glyphs = glyphFactory();
        return e(
            "span",
            { className: "field-label-with-icon" },
            e(
                "span",
                { className: "field-icon field-icon--" + iconKey, "aria-hidden": "true" },
                e(
                    "svg",
                    { className: "field-icon__glyph", viewBox: "0 0 24 24", role: "img" },
                    glyphs
                )
            ),
            e("span", { className: "field-label-text" }, text)
        );
    };

    const renderSectionTitle = function (text, key) {
        const words = text.split(" ");
        return e(
            "span",
            { className: "field-section__title field-section__title--" + key },
            words.map(function (word, wordIndex) {
                return e(
                    "span",
                    {
                        className: "field-section__title-word",
                        key: key + "-word-" + wordIndex
                    },
                    word.split("").map(function (character, charIndex) {
                        return e(
                            "span",
                            {
                                className: "field-section__char",
                                "data-char": character,
                                key: key + "-char-" + wordIndex + "-" + charIndex
                            },
                            character
                        );
                    })
                );
            })
        );
    };

    const buildDefaultFormState = function (options) {
        const setores = Array.isArray(options.setores) ? options.setores : [];
        const integracoes = Array.isArray(options.integracoes) ? options.integracoes : [];
        const turnos = Array.isArray(options.turnos) ? options.turnos : [];
        const cargos = Array.isArray(options.cargos) ? options.cargos : [];

        return {
            matricula: "",
            nome: "",
            setor: setores[0] || "",
            integracao: integracoes[0] || "",
            supervisor: "",
            turno: turnos[0] || "",
            cargo: cargos[0] || "",
            data: "",
            observacao: ""
        };
    };

    const buildDefaultOccurrenceState = function (integrationOptions, occurrenceOptions) {
        const setores = Array.isArray(integrationOptions.setores) ? integrationOptions.setores : [];
        const cargos = Array.isArray(integrationOptions.cargos) ? integrationOptions.cargos : [];
        const turnos = Array.isArray(occurrenceOptions.turnos) ? occurrenceOptions.turnos : [];
        const grauOptions = parseDegreeOptions(occurrenceOptions.graus);

        return {
            matricula: "",
            nome: "",
            setor: setores[0] || "",
            cargo: cargos[0] || "",
            turno: turnos[0] || "",
            supervisor: "",
            grau: grauOptions[0] ? grauOptions[0].value : "",
            volumes: "",
            observacao: ""
        };
    };

    const buildDefaultConfigState = function (optionsSnapshot) {
        const integration = optionsSnapshot.integration || {};
        const occurrence = optionsSnapshot.occurrence || {};

        return {
            integration: {
                setores: (integration.setores || []).join("\n"),
                cargos: (integration.cargos || []).join("\n"),
                turnos: (integration.turnos || []).join("\n"),
                integracoes: (integration.integracoes || []).join("\n")
            },
            occurrence: {
                turnos: (occurrence.turnos || []).join("\n"),
                graus: (occurrence.graus || []).join("\n")
            }
        };
    };

    const createChangeHandler = function (setState) {
        return function (field) {
            return function (event) {
                const value = event.target.value;
                setState(function (prev) {
                    return Object.assign({}, prev, {
                        [field]: value
                    });
                });
            };
        };
    };

    const safeStorageGet = function (key) {
        try {
            if (!window.localStorage) {
                return null;
            }

            return window.localStorage.getItem(key);
        } catch (error) {
            return null;
        }
    };

    const safeStorageSet = function (key, value) {
        try {
            if (!window.localStorage) {
                return;
            }

            window.localStorage.setItem(key, value);
        } catch (error) {
            // Ignora falhas de armazenamento (ex.: modo privado).
        }
    };

    const findThemeById = function (themeId) {
        if (!themeId) {
            return null;
        }

        return (
            THEMES.find(function (theme) {
                return theme.id === themeId;
            }) || null
        );
    };

    const initializeThemeSwitcher = function () {
        const modeContainer = document.querySelector(".topbar__mode");
        if (!modeContainer) {
            return;
        }

        const toggleButton = modeContainer.querySelector(".topbar__mode-toggle");
        const labelNode = modeContainer.querySelector(".topbar__mode-label");
        const menu = modeContainer.querySelector(".topbar__mode-menu");

        if (!toggleButton || !labelNode || !menu) {
            return;
        }

        const MENU_TRANSITION_MS = 180;
        let hideMenuTimeoutId = null;

        menu.hidden = true;
        menu.setAttribute("aria-hidden", "true");

        const storedTheme = findThemeById(safeStorageGet(THEME_STORAGE_KEY));
        const existingThemeClass = THEMES.find(function (theme) {
            return theme.className && document.documentElement.classList.contains(theme.className);
        });

        let activeTheme = storedTheme || existingThemeClass || THEMES[0];

        const optionButtons = [];

        THEMES.forEach(function (theme) {
            const listItem = document.createElement("li");
            listItem.className = "topbar__mode-menu-item";

            const optionButton = document.createElement("button");
            optionButton.type = "button";
            optionButton.className = "topbar__mode-option";
            optionButton.textContent = theme.label;
            optionButton.setAttribute("role", "option");
            optionButton.setAttribute("data-theme-id", theme.id);

            if (Array.isArray(theme.preview)) {
                optionButton.style.setProperty("--theme-preview-start", theme.preview[0]);
                optionButton.style.setProperty("--theme-preview-end", theme.preview[1]);
            }

            optionButton.addEventListener("click", function () {
                const nextTheme = findThemeById(optionButton.getAttribute("data-theme-id")) || THEMES[0];
                applyTheme(nextTheme);
                closeMenu();
                toggleButton.focus();
            });

            listItem.appendChild(optionButton);
            menu.appendChild(listItem);
            optionButtons.push(optionButton);
        });

        const updateSelectedOption = function () {
            optionButtons.forEach(function (button) {
                const isActive = button.getAttribute("data-theme-id") === activeTheme.id;
                button.setAttribute("aria-selected", isActive ? "true" : "false");
                button.classList.toggle("is-active", isActive);
            });
        };

        const applyTheme = function (theme, options) {
            THEME_CLASS_LIST.forEach(function (className) {
                document.documentElement.classList.remove(className);
            });

            if (theme.className) {
                document.documentElement.classList.add(theme.className);
            }

            activeTheme = theme;
            labelNode.textContent = theme.label;
            toggleButton.setAttribute("data-theme-id", theme.id);
            modeContainer.setAttribute("data-theme-id", theme.id);

            updateSelectedOption();

            if (!options || !options.skipPersist) {
                safeStorageSet(THEME_STORAGE_KEY, theme.id);
            }
        };

        const openMenu = function (shouldFocusOption) {
            if (hideMenuTimeoutId) {
                window.clearTimeout(hideMenuTimeoutId);
                hideMenuTimeoutId = null;
            }

            if (modeContainer.classList.contains("is-open")) {
                updateSelectedOption();
                if (shouldFocusOption) {
                    focusActiveOption();
                }
                return;
            }

            menu.hidden = false;
            menu.setAttribute("aria-hidden", "false");

            window.requestAnimationFrame(function () {
                modeContainer.classList.add("is-open");
            });

            toggleButton.setAttribute("aria-expanded", "true");
            updateSelectedOption();

            if (shouldFocusOption) {
                focusActiveOption();
            }
        };

        const closeMenu = function () {
            if (!modeContainer.classList.contains("is-open")) {
                return;
            }

            modeContainer.classList.remove("is-open");
            toggleButton.setAttribute("aria-expanded", "false");
            menu.setAttribute("aria-hidden", "true");

            hideMenuTimeoutId = window.setTimeout(function () {
                menu.hidden = true;
            }, MENU_TRANSITION_MS);
        };

        const focusActiveOption = function () {
            const activeButton = optionButtons.find(function (button) {
                return button.getAttribute("data-theme-id") === activeTheme.id;
            });

            const targetButton = activeButton || optionButtons[0];
            if (targetButton) {
                targetButton.focus();
            }
        };

        toggleButton.addEventListener("click", function () {
            if (modeContainer.classList.contains("is-open")) {
                closeMenu();
            } else {
                openMenu(false);
            }
        });

        toggleButton.addEventListener("keydown", function (event) {
            if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                openMenu(true);
            }
        });

        menu.addEventListener("keydown", function (event) {
            const currentIndex = optionButtons.indexOf(document.activeElement);

            if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                event.preventDefault();

                if (currentIndex === -1) {
                    focusActiveOption();
                    return;
                }

                const delta = event.key === "ArrowDown" ? 1 : -1;
                const nextIndex = (currentIndex + delta + optionButtons.length) % optionButtons.length;
                optionButtons[nextIndex].focus();
            } else if (event.key === "Home") {
                event.preventDefault();
                if (optionButtons[0]) {
                    optionButtons[0].focus();
                }
            } else if (event.key === "End") {
                event.preventDefault();
                if (optionButtons.length) {
                    optionButtons[optionButtons.length - 1].focus();
                }
            } else if (event.key === "Escape") {
                event.preventDefault();
                closeMenu();
                toggleButton.focus();
            }
        });

        document.addEventListener("click", function (event) {
            if (!modeContainer.contains(event.target)) {
                closeMenu();
            }
        });

        document.addEventListener("keydown", function (event) {
            if (event.key === "Escape" && modeContainer.classList.contains("is-open")) {
                closeMenu();
                toggleButton.focus();
            }
        });

        applyTheme(activeTheme, { skipPersist: true });
    };

    const initializeTopbarNavigation = function () {
        const navButtons = Array.from(document.querySelectorAll(".topbar__nav-button[data-view]"));
        if (!navButtons.length) {
            return;
        }

        const setActiveButton = function (targetView) {
            navButtons.forEach(function (button) {
                const buttonView = button.getAttribute("data-view");
                const isActive = buttonView === targetView;
                button.classList.toggle("is-active", isActive);

                if (isActive) {
                    button.setAttribute("aria-current", "page");
                } else {
                    button.removeAttribute("aria-current");
                }
            });
        };

        navButtons.forEach(function (button) {
            button.addEventListener("click", function (event) {
                event.preventDefault();
                const view = button.getAttribute("data-view");
                if (!view || VALID_VIEW_IDS.indexOf(view) === -1) {
                    return;
                }

                setActiveButton(view);

                window.dispatchEvent(
                    new CustomEvent("app:view-change", {
                        detail: { view: view }
                    })
                );
            });
        });

        window.addEventListener("app:view-ready", function (event) {
            const detail = event.detail || {};
            const view = detail.view;
            if (!view) {
                return;
            }

            setActiveButton(view);
        });

        const storedView = safeStorageGet(VIEW_STORAGE_KEY);
        const hasStoredView = navButtons.some(function (button) {
            return button.getAttribute("data-view") === storedView;
        });
        const fallbackView = navButtons[0] ? navButtons[0].getAttribute("data-view") : null;
        const initialView = hasStoredView ? storedView : fallbackView;

        if (initialView) {
            setActiveButton(initialView);
        }
    };

    function App() {
        const [integrationOptions, setIntegrationOptions] = React.useState(function () {
            return normalizeIntegrationOptions(DEFAULT_INTEGRATION_OPTIONS);
        });
        const [occurrenceOptions, setOccurrenceOptions] = React.useState(function () {
            return normalizeOccurrenceOptions(DEFAULT_OCCURRENCE_OPTIONS);
        });
        const [activeView, setActiveView] = React.useState(function () {
            const storedView = safeStorageGet(VIEW_STORAGE_KEY);
            if (storedView && VALID_VIEW_IDS.indexOf(storedView) !== -1) {
                return storedView;
            }
            return "integration";
        });
        const [formData, setFormData] = React.useState(function () {
            return buildDefaultFormState(DEFAULT_INTEGRATION_OPTIONS);
        });
        const [occurrenceData, setOccurrenceData] = React.useState(function () {
            return buildDefaultOccurrenceState(DEFAULT_INTEGRATION_OPTIONS, DEFAULT_OCCURRENCE_OPTIONS);
        });
        const [configData, setConfigData] = React.useState(function () {
            return buildDefaultConfigState({
                integration: DEFAULT_INTEGRATION_OPTIONS,
                occurrence: DEFAULT_OCCURRENCE_OPTIONS
            });
        });
        const [tableDataset, setTableDataset] = React.useState(TABLE_DEFAULT_DATASET);
        const [integrationStatus, setIntegrationStatus] = React.useState(null);
        const [occurrenceStatus, setOccurrenceStatus] = React.useState(null);
        const [configStatus, setConfigStatus] = React.useState(null);

        const handleIntegrationChange = createChangeHandler(setFormData);
        const handleOccurrenceChange = createChangeHandler(setOccurrenceData);
        const handleConfigChange = function (category, field) {
            return function (event) {
                const value = event.target.value;

                setConfigData(function (previous) {
                    const nextCategory = Object.assign({}, previous[category], {
                        [field]: value
                    });

                    return Object.assign({}, previous, {
                        [category]: nextCategory
                    });
                });
            };
        };

        const buildOption = function (value) {
            return e("option", { value: value, key: value }, value);
        };

        const buildLabeledOption = function (option) {
            return e("option", { value: option.value, key: option.value }, option.label);
        };

        const handleIntegrationSubmit = async function (event) {
            event.preventDefault();

            const sanitized = {
                matricula: (formData.matricula || "").trim(),
                nome: (formData.nome || "").trim(),
                setor: formData.setor,
                integracao: formData.integracao,
                supervisor: (formData.supervisor || "").trim(),
                turno: formData.turno,
                cargo: formData.cargo,
                data: formData.data || null,
                observacao: (formData.observacao || "").trim()
            };

            const payload = Object.assign({}, sanitized, {
                supervisor: sanitized.supervisor.toUpperCase(),
                submitted_at: new Date().toISOString()
            });

            console.group("Integração submetida");
            console.table(payload);
            console.groupEnd();

            setIntegrationStatus({ type: "pending", message: "Enviando dados para o backend..." });

            try {
                const response = await fetch("/api/integration", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(payload)
                });

                const responseBody = await response.json().catch(function () {
                    return null;
                });

                if (!response.ok) {
                    const errorMessage = responseBody && responseBody.error ? responseBody.error : "Falha ao enviar os dados.";
                    throw new Error(errorMessage);
                }

                const nextOptions = responseBody && responseBody.options
                    ? normalizeIntegrationOptions(responseBody.options)
                    : integrationOptions;

                setIntegrationOptions(nextOptions);
                setIntegrationStatus({
                    type: "success",
                    message:
                        "Integração registrada com sucesso no backend." +
                        (responseBody && responseBody.record_id ? " ID " + responseBody.record_id : "")
                });

                setFormData(buildDefaultFormState(nextOptions));
            } catch (error) {
                const message = error && error.message ? error.message : "Erro inesperado ao enviar os dados.";
                setIntegrationStatus({ type: "error", message: message });
            }
        };

        const handleOccurrenceSubmit = async function (event) {
            event.preventDefault();

            const sanitized = {
                matricula: (occurrenceData.matricula || "").trim(),
                nome: (occurrenceData.nome || "").trim(),
                setor: occurrenceData.setor,
                cargo: occurrenceData.cargo,
                turno: occurrenceData.turno,
                supervisor: (occurrenceData.supervisor || "").trim(),
                grau: occurrenceData.grau,
                volumes: occurrenceData.volumes,
                observacao: (occurrenceData.observacao || "").trim()
            };

            const degreeOptions = parseDegreeOptions(occurrenceOptions.graus);
            const selectedDegree = degreeOptions.find(function (option) {
                return option.value === sanitized.grau;
            });
            const payload = Object.assign({}, sanitized, {
                grau_label: selectedDegree ? selectedDegree.label : sanitized.grau
            });

            console.group("Ocorrência registrada");
            console.table(payload);
            console.groupEnd();

            setOccurrenceStatus({ type: "pending", message: "Salvando ocorrência no backend..." });

            try {
                const response = await fetch("/api/occurrence", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(payload)
                });

                const responseBody = await response.json().catch(function () {
                    return null;
                });

                if (!response.ok) {
                    const errorMessage = responseBody && responseBody.error ? responseBody.error : "Falha ao registrar ocorrência.";
                    throw new Error(errorMessage);
                }

                const nextOptions = responseBody && responseBody.options
                    ? normalizeOccurrenceOptions(responseBody.options)
                    : occurrenceOptions;

                setOccurrenceOptions(nextOptions);
                setOccurrenceStatus({
                    type: "success",
                    message: "Ocorrência registrada com sucesso." +
                        (responseBody && responseBody.record_id ? " ID " + responseBody.record_id : "")
                });

                setOccurrenceData(buildDefaultOccurrenceState(integrationOptions, nextOptions));
            } catch (error) {
                const message = error && error.message ? error.message : "Erro inesperado ao registrar a ocorrência.";
                setOccurrenceStatus({ type: "error", message: message });
            }
        };

        const handleConfigSubmit = async function (event) {
            event.preventDefault();

            const parseList = function (text) {
                if (!text) {
                    return [];
                }

                return text
                    .split(/\r?\n/)
                    .map(function (item) {
                        return item.trim();
                    })
                    .filter(function (item) {
                        return item.length > 0;
                    });
            };

            const payload = {
                integration: {
                    setores: parseList(configData.integration.setores),
                    cargos: parseList(configData.integration.cargos),
                    turnos: parseList(configData.integration.turnos),
                    integracoes: parseList(configData.integration.integracoes)
                },
                occurrence: {
                    turnos: parseList(configData.occurrence.turnos),
                    graus: parseList(configData.occurrence.graus)
                }
            };

            setConfigStatus({ type: "pending", message: "Salvando configurações no backend..." });

            try {
                const response = await fetch("/api/configuration", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(payload)
                });

                const snapshot = await response.json().catch(function () {
                    return null;
                });

                if (!response.ok || !snapshot) {
                    const errorMessage = snapshot && snapshot.error ? snapshot.error : "Falha ao atualizar as configurações.";
                    throw new Error(errorMessage);
                }

                const nextIntegrationOptions = normalizeIntegrationOptions(snapshot.integration);
                const nextOccurrenceOptions = normalizeOccurrenceOptions(snapshot.occurrence);

                setIntegrationOptions(nextIntegrationOptions);
                setOccurrenceOptions(nextOccurrenceOptions);
                setConfigData(buildDefaultConfigState(snapshot));
                setConfigStatus({ type: "success", message: "Configurações atualizadas com sucesso." });
            } catch (error) {
                const message = error && error.message ? error.message : "Erro inesperado ao atualizar as configurações.";
                setConfigStatus({ type: "error", message: message });
            }
        };

        const handleResetConfigs = function () {
            const snapshot = {
                integration: DEFAULT_INTEGRATION_OPTIONS,
                occurrence: DEFAULT_OCCURRENCE_OPTIONS
            };
            setConfigData(buildDefaultConfigState(snapshot));
            setConfigStatus({
                type: "info",
                message: "Valores padrão restaurados localmente. Salve para persistir no backend."
            });
        };

        React.useEffect(function () {
            let isMounted = true;
            const controller = new AbortController();

            const loadConfiguration = async function () {
                try {
                    const response = await fetch("/api/configuration", {
                        method: "GET",
                        signal: controller.signal
                    });

                    const snapshot = await response.json().catch(function () {
                        return null;
                    });

                    if (!response.ok || !snapshot) {
                        throw new Error("Não foi possível carregar as configurações iniciais.");
                    }

                    if (!isMounted) {
                        return;
                    }

                    const nextIntegrationOptions = normalizeIntegrationOptions(snapshot.integration);
                    const nextOccurrenceOptions = normalizeOccurrenceOptions(snapshot.occurrence);

                    setIntegrationOptions(nextIntegrationOptions);
                    setOccurrenceOptions(nextOccurrenceOptions);
                    setFormData(buildDefaultFormState(nextIntegrationOptions));
                    setOccurrenceData(
                        buildDefaultOccurrenceState(nextIntegrationOptions, nextOccurrenceOptions)
                    );
                    setConfigData(buildDefaultConfigState(snapshot));
                } catch (error) {
                    console.warn(error instanceof Error ? error.message : error);
                }
            };

            loadConfiguration();

            return function () {
                isMounted = false;
                controller.abort();
            };
        }, []);

        React.useEffect(function () {
            const handleViewChange = function (event) {
                const detail = event.detail || {};
                const nextView = detail.view;

                if (!nextView || VALID_VIEW_IDS.indexOf(nextView) === -1) {
                    return;
                }

                setActiveView(function (previous) {
                    if (previous === nextView) {
                        return previous;
                    }

                    return nextView;
                });

                safeStorageSet(VIEW_STORAGE_KEY, nextView);
            };

            window.addEventListener("app:view-change", handleViewChange);

            return function () {
                window.removeEventListener("app:view-change", handleViewChange);
            };
        }, []);

        React.useEffect(function () {
            safeStorageSet(VIEW_STORAGE_KEY, activeView);
            window.dispatchEvent(
                new CustomEvent("app:view-ready", {
                    detail: { view: activeView }
                })
            );
        }, [activeView]);

        React.useEffect(
            function () {
                if (!integrationStatus || integrationStatus.type !== "success") {
                    return undefined;
                }

                const timeoutId = window.setTimeout(function () {
                    setIntegrationStatus(null);
                }, 3500);

                return function () {
                    window.clearTimeout(timeoutId);
                };
            },
            [integrationStatus]
        );

        React.useEffect(
            function () {
                if (!occurrenceStatus || occurrenceStatus.type !== "success") {
                    return undefined;
                }

                const timeoutId = window.setTimeout(function () {
                    setOccurrenceStatus(null);
                }, 3500);

                return function () {
                    window.clearTimeout(timeoutId);
                };
            },
            [occurrenceStatus]
        );

        React.useEffect(
            function () {
                if (!configStatus || configStatus.type !== "success") {
                    return undefined;
                }

                const timeoutId = window.setTimeout(function () {
                    setConfigStatus(null);
                }, 3500);

                return function () {
                    window.clearTimeout(timeoutId);
                };
            },
            [configStatus]
        );

        React.useEffect(
            function () {
                setFormData(function (previous) {
                    const next = Object.assign({}, previous, {
                        setor: ensureFromList(previous.setor, integrationOptions.setores),
                        integracao: ensureFromList(previous.integracao, integrationOptions.integracoes),
                        turno: ensureFromList(previous.turno, integrationOptions.turnos),
                        cargo: ensureFromList(previous.cargo, integrationOptions.cargos)
                    });

                    if (
                        next.setor === previous.setor &&
                        next.integracao === previous.integracao &&
                        next.turno === previous.turno &&
                        next.cargo === previous.cargo
                    ) {
                        return previous;
                    }

                    return next;
                });
            },
            [integrationOptions]
        );

        React.useEffect(
            function () {
                const degreeOptions = parseDegreeOptions(occurrenceOptions.graus);
                const degreeValues = degreeOptions.map(function (option) {
                    return option.value;
                });

                setOccurrenceData(function (previous) {
                    const next = Object.assign({}, previous, {
                        setor: ensureFromList(previous.setor, integrationOptions.setores),
                        cargo: ensureFromList(previous.cargo, integrationOptions.cargos),
                        turno: ensureFromList(previous.turno, occurrenceOptions.turnos),
                        grau: ensureFromList(previous.grau, degreeValues)
                    });

                    if (
                        next.setor === previous.setor &&
                        next.cargo === previous.cargo &&
                        next.turno === previous.turno &&
                        next.grau === previous.grau
                    ) {
                        return previous;
                    }

                    return next;
                });
            },
            [integrationOptions, occurrenceOptions]
        );

        const handleNavigateToTable = function () {
            setTableDataset("integration");
            setActiveView("table");
        };

        const handleConsultHistory = function () {
            setTableDataset("occurrence");
            setActiveView("table");
        };

        const metadata = VIEW_CONFIG[activeView] || VIEW_CONFIG.integration;
        const TableView = TableViewComponent;

        const renderTableView = function () {
            if (!TableView) {
                return e(
                    "div",
                    { className: "table-view--unavailable" },
                    "A visualização de tabela não está disponível no momento."
                );
            }

            return e(TableView, {
                dataset: tableDataset,
                onDatasetChange: setTableDataset
            });
        };

        const renderIdentificationSection = function (state, changeHandler) {
            return e(
                "section",
                { className: "field-section" },
                e(
                    "div",
                    { className: "field-section__header field-section__header--identificacao" },
                    e(
                        "div",
                        { className: "icon-badge icon-badge--blue", "aria-hidden": "true" },
                        e("span", { className: "icon-badge__glyph" }, "ID")
                    ),
                    e(
                        "div",
                        { className: "field-section__titles" },
                        e(
                            "div",
                            { className: "field-section__title-shell" },
                            e("span", {
                                className: "field-section__hover field-section__hover--upper",
                                "aria-hidden": "true"
                            }),
                            e("span", {
                                className: "field-section__hover field-section__hover--lower",
                                "aria-hidden": "true"
                            }),
                            renderSectionTitle("Identificação do Colaborador", "identificacao")
                        ),
                        e(
                            "span",
                            { className: "field-section__subtitle" },
                            "Informe matrícula e nome completo"
                        )
                    )
                ),
                e(
                    "div",
                    { className: "field-section__grid field-section__grid--cols-2" },
                    e(
                        "label",
                        { className: "form-field", htmlFor: "matricula" },
                        renderFieldLabel("Matrícula", "matricula"),
                        e("input", {
                            id: "matricula",
                            type: "number",
                            inputMode: "numeric",
                            min: "0",
                            placeholder: "Ex.: 12345",
                            value: state.matricula,
                            onChange: changeHandler("matricula"),
                            required: true
                        })
                    ),
                    e(
                        "label",
                        { className: "form-field", htmlFor: "nome" },
                        renderFieldLabel("Nome do colaborador", "nome"),
                        e("input", {
                            id: "nome",
                            type: "text",
                            placeholder: "Ex.: Maria Silva Santos",
                            value: state.nome,
                            onChange: changeHandler("nome"),
                            required: true,
                            maxLength: 120
                        })
                    )
                )
            );
        };

        const renderRoleSection = function (state, changeHandler, options) {
            const config = Object.assign(
                {
                    headerClass: "field-section__header--funcao",
                    badgeModifier: "",
                    badgeGlyph: "FL",
                    titleText: "Função e localização",
                    titleKey: "funcao",
                    subtitleText: "Defina setor e cargo do colaborador"
                },
                options || {}
            );

            const badgeClass = config.badgeModifier
                ? "icon-badge " + config.badgeModifier
                : "icon-badge";

            return e(
                "section",
                { className: "field-section" },
                e(
                    "div",
                    { className: "field-section__header " + config.headerClass },
                    e(
                        "div",
                        { className: badgeClass, "aria-hidden": "true" },
                        e("span", { className: "icon-badge__glyph" }, config.badgeGlyph)
                    ),
                    e(
                        "div",
                        { className: "field-section__titles" },
                        e(
                            "div",
                            { className: "field-section__title-shell" },
                            e("span", {
                                className: "field-section__hover field-section__hover--upper",
                                "aria-hidden": "true"
                            }),
                            e("span", {
                                className: "field-section__hover field-section__hover--lower",
                                "aria-hidden": "true"
                            }),
                            renderSectionTitle(config.titleText, config.titleKey)
                        ),
                        e(
                            "span",
                            { className: "field-section__subtitle" },
                            config.subtitleText
                        )
                    )
                ),
                e(
                    "div",
                    { className: "field-section__grid field-section__grid--cols-2" },
                    e(
                        "label",
                        { className: "form-field", htmlFor: "setor" },
                        renderFieldLabel("Setor", "setor"),
                        e(
                            "select",
                            {
                                id: "setor",
                                value: state.setor,
                                onChange: changeHandler("setor"),
                                required: true
                            },
                            (integrationOptions.setores || []).map(buildOption)
                        )
                    ),
                    e(
                        "label",
                        { className: "form-field", htmlFor: "cargo" },
                        renderFieldLabel("Cargo", "cargo"),
                        e(
                            "select",
                            {
                                id: "cargo",
                                value: state.cargo,
                                onChange: changeHandler("cargo"),
                                required: true
                            },
                            (integrationOptions.cargos || []).map(buildOption)
                        )
                    )
                )
            );
        };

        const renderIntegrationManagementSection = function () {
            return e(
                "section",
                { className: "field-section" },
                e(
                    "div",
                    { className: "field-section__header field-section__header--gestao" },
                    e(
                        "div",
                        { className: "icon-badge icon-badge--green", "aria-hidden": "true" },
                        e("span", { className: "icon-badge__glyph" }, "GI")
                    ),
                    e(
                        "div",
                        { className: "field-section__titles" },
                        e(
                            "div",
                            { className: "field-section__title-shell" },
                            e("span", {
                                className: "field-section__hover field-section__hover--upper",
                                "aria-hidden": "true"
                            }),
                            e("span", {
                                className: "field-section__hover field-section__hover--lower",
                                "aria-hidden": "true"
                            }),
                            renderSectionTitle("Gestão e integração", "gestao")
                        ),
                        e(
                            "span",
                            { className: "field-section__subtitle" },
                            "Controle de turno, supervisor e integração"
                        )
                    )
                ),
                e(
                    "div",
                    { className: "field-section__grid field-section__grid--cols-2" },
                    e(
                        "label",
                        { className: "form-field", htmlFor: "turno" },
                        renderFieldLabel("Turno", "turno"),
                        e(
                            "select",
                            {
                                id: "turno",
                                value: formData.turno,
                                onChange: handleIntegrationChange("turno"),
                                required: true
                            },
                            (integrationOptions.turnos || []).map(buildOption)
                        )
                    ),
                    e(
                        "label",
                        { className: "form-field", htmlFor: "integracao" },
                        renderFieldLabel("Integração", "integracao"),
                        e(
                            "select",
                            {
                                id: "integracao",
                                value: formData.integracao,
                                onChange: handleIntegrationChange("integracao"),
                                required: true
                            },
                            (integrationOptions.integracoes || []).map(buildOption)
                        )
                    ),
                    e(
                        "label",
                        { className: "form-field", htmlFor: "supervisor" },
                        renderFieldLabel("Supervisor", "supervisor"),
                        e("input", {
                            id: "supervisor",
                            type: "text",
                            placeholder: "Nome do supervisor",
                            value: formData.supervisor,
                            onChange: handleIntegrationChange("supervisor"),
                            required: true,
                            maxLength: 120
                        }),
                        e(
                            "span",
                            { className: "form-field-description" },
                            "Será salvo automaticamente em maiúsculas"
                        )
                    ),
                    e(
                        "label",
                        { className: "form-field", htmlFor: "data" },
                        renderFieldLabel("Data", "data"),
                        e("input", {
                            id: "data",
                            type: "date",
                            value: formData.data,
                            onChange: handleIntegrationChange("data"),
                            required: true
                        })
                    )
                )
            );
        };

        const renderOccurrenceDetailsSection = function () {
            return e(
                "section",
                { className: "field-section" },
                e(
                    "div",
                    { className: "field-section__header field-section__header--ocorrencia" },
                    e(
                        "div",
                        { className: "icon-badge icon-badge--danger", "aria-hidden": "true" },
                        e("span", { className: "icon-badge__glyph" }, "OC")
                    ),
                    e(
                        "div",
                        { className: "field-section__titles" },
                        e(
                            "div",
                            { className: "field-section__title-shell" },
                            e("span", {
                                className: "field-section__hover field-section__hover--upper",
                                "aria-hidden": "true"
                            }),
                            e("span", {
                                className: "field-section__hover field-section__hover--lower",
                                "aria-hidden": "true"
                            }),
                            renderSectionTitle("Detalhes da ocorrência", "ocorrencia")
                        ),
                        e(
                            "span",
                            { className: "field-section__subtitle" },
                            "Informe turno, responsáveis e gravidade do evento"
                        )
                    )
                ),
                e(
                    "div",
                    { className: "field-section__grid field-section__grid--cols-2" },
                    e(
                        "label",
                        { className: "form-field", htmlFor: "turnoOcorrencia" },
                        renderFieldLabel("Turno", "turno"),
                        e(
                            "select",
                            {
                                id: "turnoOcorrencia",
                                value: occurrenceData.turno,
                                onChange: handleOccurrenceChange("turno"),
                                required: true
                            },
                            (occurrenceOptions.turnos || []).map(buildOption)
                        )
                    ),
                    e(
                        "label",
                        { className: "form-field", htmlFor: "supervisorOcorrencia" },
                        renderFieldLabel("Supervisor responsável", "supervisor"),
                        e("input", {
                            id: "supervisorOcorrencia",
                            type: "text",
                            placeholder: "Quem acompanhou o colaborador",
                            value: occurrenceData.supervisor,
                            onChange: handleOccurrenceChange("supervisor"),
                            required: true,
                            maxLength: 120
                        }),
                        e(
                            "span",
                            { className: "form-field-description" },
                            "Informe o líder presente no momento do ocorrido"
                        )
                    ),
                    e(
                        "label",
                        { className: "form-field", htmlFor: "grauOcorrencia" },
                        renderFieldLabel("Grau de ocorrência", "gravidade"),
                        e(
                            "select",
                            {
                                id: "grauOcorrencia",
                                value: occurrenceData.grau,
                                onChange: handleOccurrenceChange("grau"),
                                required: true
                            },
                            parseDegreeOptions(occurrenceOptions.graus).map(buildLabeledOption)
                        ),
                        e(
                            "span",
                            { className: "form-field-description" },
                            "Utilize a escala para indicar a severidade da divergência"
                        )
                    ),
                    e(
                        "label",
                        { className: "form-field", htmlFor: "volumesOcorrencia" },
                        renderFieldLabel("Quantidade de volumes", "volumes"),
                        e("input", {
                            id: "volumesOcorrencia",
                            type: "number",
                            inputMode: "numeric",
                            min: "0",
                            placeholder: "Ex.: 12",
                            value: occurrenceData.volumes,
                            onChange: handleOccurrenceChange("volumes"),
                            required: true
                        })
                    )
                )
            );
        };

        const renderObservationsSection = function (state, changeHandler, options) {
            const config = Object.assign(
                {
                    headerClass: "field-section__header--observacoes",
                    badgeModifier: "icon-badge--violet",
                    badgeGlyph: "OB",
                    titleText: "Observações adicionais",
                    titleKey: "observacoes",
                    subtitleText: "Contextualize detalhes relevantes do colaborador",
                    textareaId: "observacao",
                    placeholder: "Digite observações relevantes sobre o colaborador ou processo..."
                },
                options || {}
            );

            const badgeClass = config.badgeModifier
                ? "icon-badge " + config.badgeModifier
                : "icon-badge";

            return e(
                "section",
                { className: "field-section" },
                e(
                    "div",
                    { className: "field-section__header " + config.headerClass },
                    e(
                        "div",
                        { className: badgeClass, "aria-hidden": "true" },
                        e("span", { className: "icon-badge__glyph" }, config.badgeGlyph)
                    ),
                    e(
                        "div",
                        { className: "field-section__titles" },
                        e(
                            "div",
                            { className: "field-section__title-shell" },
                            e("span", {
                                className: "field-section__hover field-section__hover--upper",
                                "aria-hidden": "true"
                            }),
                            e("span", {
                                className: "field-section__hover field-section__hover--lower",
                                "aria-hidden": "true"
                            }),
                            renderSectionTitle(config.titleText, config.titleKey)
                        ),
                        e(
                            "span",
                            { className: "field-section__subtitle" },
                            config.subtitleText
                        )
                    )
                ),
                e(
                    "div",
                    { className: "field-section__grid field-section__grid--cols-1" },
                    e(
                        "label",
                        { className: "form-field", htmlFor: config.textareaId },
                        renderFieldLabel("Observação", "observacao"),
                        e("textarea", {
                            id: config.textareaId,
                            placeholder: config.placeholder,
                            value: state.observacao || "",
                            onChange: changeHandler("observacao"),
                            maxLength: 400
                        })
                    )
                )
            );
        };

        const renderConfigurationForm = function () {
            return e(
                "form",
                { className: "integration-form", onSubmit: handleConfigSubmit },
                configStatus
                    ? e(
                          "div",
                          {
                              className:
                                  "form-status form-status--" + (configStatus.type || "info"),
                              role: configStatus.type === "error" ? "alert" : "status"
                          },
                          configStatus.message
                      )
                    : null,
                e(
                    "section",
                    { className: "field-section" },
                    e(
                        "div",
                        { className: "field-section__header field-section__header--configuracao" },
                        e(
                            "div",
                            { className: "icon-badge icon-badge--slate", "aria-hidden": "true" },
                            e("span", { className: "icon-badge__glyph" }, "IN")
                        ),
                        e(
                            "div",
                            { className: "field-section__titles" },
                            e(
                                "div",
                                { className: "field-section__title-shell" },
                                e("span", {
                                    className: "field-section__hover field-section__hover--upper",
                                    "aria-hidden": "true"
                                }),
                                e("span", {
                                    className: "field-section__hover field-section__hover--lower",
                                    "aria-hidden": "true"
                                }),
                                renderSectionTitle("Listas de Integração", "config-integracao")
                            ),
                            e(
                                "span",
                                { className: "field-section__subtitle" },
                                "Gerencie os valores exibidos no formulário de integração"
                            )
                        )
                    ),
                    e(
                        "div",
                        { className: "field-section__grid field-section__grid--cols-2" },
                        e(
                            "label",
                            { className: "form-field", htmlFor: "config-setores" },
                            renderFieldLabel("Lista de setores", "setor"),
                            e("textarea", {
                                id: "config-setores",
                                rows: 5,
                                value: configData.integration.setores,
                                onChange: handleConfigChange("integration", "setores"),
                                placeholder: "Um item por linha"
                            }),
                            e(
                                "span",
                                { className: "form-field-description" },
                                "Separe cada setor em uma linha."
                            )
                        ),
                        e(
                            "label",
                            { className: "form-field", htmlFor: "config-cargos" },
                            renderFieldLabel("Lista de cargos", "cargo"),
                            e("textarea", {
                                id: "config-cargos",
                                rows: 5,
                                value: configData.integration.cargos,
                                onChange: handleConfigChange("integration", "cargos"),
                                placeholder: "Um item por linha"
                            }),
                            e(
                                "span",
                                { className: "form-field-description" },
                                "Use a ordem desejada para exibição nos formulários."
                            )
                        ),
                        e(
                            "label",
                            { className: "form-field", htmlFor: "config-turnos" },
                            renderFieldLabel("Turnos disponíveis", "turno"),
                            e("textarea", {
                                id: "config-turnos",
                                rows: 4,
                                value: configData.integration.turnos,
                                onChange: handleConfigChange("integration", "turnos"),
                                placeholder: "Um item por linha"
                            }),
                            e(
                                "span",
                                { className: "form-field-description" },
                                "Esses valores alimentam o campo de turno na integração."
                            )
                        ),
                        e(
                            "label",
                            { className: "form-field", htmlFor: "config-integracoes" },
                            renderFieldLabel("Status de integração", "integracao"),
                            e("textarea", {
                                id: "config-integracoes",
                                rows: 4,
                                value: configData.integration.integracoes,
                                onChange: handleConfigChange("integration", "integracoes"),
                                placeholder: "Um item por linha"
                            }),
                            e(
                                "span",
                                { className: "form-field-description" },
                                "Ex.: Sim, Não, Em andamento"
                            )
                        )
                    )
                ),
                e(
                    "section",
                    { className: "field-section" },
                    e(
                        "div",
                        { className: "field-section__header field-section__header--configuracao" },
                        e(
                            "div",
                            { className: "icon-badge icon-badge--danger", "aria-hidden": "true" },
                            e("span", { className: "icon-badge__glyph" }, "OC")
                        ),
                        e(
                            "div",
                            { className: "field-section__titles" },
                            e(
                                "div",
                                { className: "field-section__title-shell" },
                                e("span", {
                                    className: "field-section__hover field-section__hover--upper",
                                    "aria-hidden": "true"
                                }),
                                e("span", {
                                    className: "field-section__hover field-section__hover--lower",
                                    "aria-hidden": "true"
                                }),
                                renderSectionTitle("Listas de Ocorrência", "config-ocorrencia")
                            ),
                            e(
                                "span",
                                { className: "field-section__subtitle" },
                                "Adapte os valores usados no registro de ocorrências"
                            )
                        )
                    ),
                    e(
                        "div",
                        { className: "field-section__grid field-section__grid--cols-2" },
                        e(
                            "label",
                            { className: "form-field", htmlFor: "config-turnos-ocorrencia" },
                            renderFieldLabel("Turnos monitorados", "turno"),
                            e("textarea", {
                                id: "config-turnos-ocorrencia",
                                rows: 4,
                                value: configData.occurrence.turnos,
                                onChange: handleConfigChange("occurrence", "turnos"),
                                placeholder: "Um item por linha"
                            }),
                            e(
                                "span",
                                { className: "form-field-description" },
                                "Inclua os turnos que podem receber ocorrências."
                            )
                        ),
                        e(
                            "label",
                            { className: "form-field", htmlFor: "config-graus-ocorrencia" },
                            renderFieldLabel("Escala de gravidade", "gravidade"),
                            e("textarea", {
                                id: "config-graus-ocorrencia",
                                rows: 6,
                                value: configData.occurrence.graus,
                                onChange: handleConfigChange("occurrence", "graus"),
                                placeholder: "Um item por linha"
                            }),
                            e(
                                "span",
                                { className: "form-field-description" },
                                "Ex.: 0 - Muito baixo"
                            )
                        )
                    )
                ),
                renderActionBar(
                    metadata.primaryActionLabel,
                    metadata.secondaryActionLabel,
                    metadata.note,
                    handleResetConfigs
                )
            );
        };

        const renderActionBar = function (primaryLabel, secondaryLabel, noteLabel, secondaryHandler) {
            return e(
                "div",
                { className: "action-bar" },
                e(
                    "div",
                    { className: "action-buttons" },
                    e(
                        "button",
                        { type: "submit", className: "primary-button" },
                        primaryLabel
                    ),
                    secondaryLabel
                        ? e(
                              "button",
                              {
                                  type: "button",
                                  className: "ghost-button",
                                  onClick: secondaryHandler || null
                              },
                              secondaryLabel
                          )
                        : null
                ),
                noteLabel ? e("span", { className: "action-note" }, noteLabel) : null
            );
        };

        const renderIntegrationForm = function () {
            return e(
                "form",
                { className: "integration-form", onSubmit: handleIntegrationSubmit },
                integrationStatus
                    ? e(
                          "div",
                          {
                              className:
                                  "form-status form-status--" + (integrationStatus.type || "info"),
                              role: integrationStatus.type === "error" ? "alert" : "status"
                          },
                          integrationStatus.message
                      )
                    : null,
                e(
                    "div",
                    { className: "field-section-pair" },
                    renderIdentificationSection(formData, handleIntegrationChange),
                    renderRoleSection(formData, handleIntegrationChange, {})
                ),
                renderIntegrationManagementSection(),
                renderObservationsSection(formData, handleIntegrationChange, {}),
                renderActionBar(
                    metadata.primaryActionLabel,
                    metadata.secondaryActionLabel,
                    metadata.note,
                    handleNavigateToTable
                )
            );
        };

        const renderOccurrenceForm = function () {
            return e(
                "form",
                { className: "integration-form", onSubmit: handleOccurrenceSubmit },
                occurrenceStatus
                    ? e(
                          "div",
                          {
                              className:
                                  "form-status form-status--" + (occurrenceStatus.type || "info"),
                              role: occurrenceStatus.type === "error" ? "alert" : "status"
                          },
                          occurrenceStatus.message
                      )
                    : null,
                e(
                    "div",
                    { className: "field-section-pair" },
                    renderIdentificationSection(occurrenceData, handleOccurrenceChange),
                    renderRoleSection(occurrenceData, handleOccurrenceChange, {
                        subtitleText: "Associe o setor e o cargo vinculados à ocorrência"
                    })
                ),
                renderOccurrenceDetailsSection(),
                renderObservationsSection(occurrenceData, handleOccurrenceChange, {
                    headerClass: "field-section__header--ocorrencia",
                    badgeModifier: "icon-badge--danger",
                    badgeGlyph: "OC",
                    titleText: "Relato da ocorrência",
                    titleKey: "ocorrencia-relato",
                    subtitleText: "Detalhe o que aconteceu, impactos percebidos e ações imediatas",
                    textareaId: "observacaoOcorrencia",
                    placeholder: "Descreva o ocorrido com clareza, incluindo volumes, causas e ações tomadas."
                }),
                renderActionBar(
                    metadata.primaryActionLabel,
                    metadata.secondaryActionLabel,
                    metadata.note,
                    handleConsultHistory
                )
            );
        };

        const containerClass = ["app-container", "app-container--" + activeView]
            .filter(Boolean)
            .join(" ");
        const wrapperClass = [
            "form-wrapper",
            activeView === "table" ? "form-wrapper--table" : ""
        ]
            .filter(Boolean)
            .join(" ");

        return e(
            "div",
            { className: containerClass },
            e(
                "header",
                { className: "app-header" },
                e("h1", null, metadata.title),
                e("p", null, metadata.description)
            ),
            e(
                "main",
                { className: wrapperClass },
                activeView === "integration"
                    ? renderIntegrationForm()
                    : activeView === "occurrence"
                    ? renderOccurrenceForm()
                    : activeView === "settings"
                    ? renderConfigurationForm()
                    : renderTableView()
            )
        );
    }

    const rootElement = document.getElementById("root");
    const root = ReactDOM.createRoot(rootElement);
    root.render(e(App));

    initializeTopbarNavigation();
    initializeThemeSwitcher();
})();
