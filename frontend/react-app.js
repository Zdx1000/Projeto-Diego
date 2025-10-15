(function () {
    const e = React.createElement;

    const SETORES = [
        "Produção",
        "Controle de estoque",
        "Expedição",
        "Qualidade",
        "Recebimento",
        "SME"
    ];

    const INTEGRACOES = ["Sim", "Não"];
    const TURNOS = ["1° Turno", "2° Turno"];
    const CARGOS = ["Operador 1", "Operador 2", "Operador 3"];

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

    const buildDefaultFormState = function () {
        return {
            matricula: "",
            nome: "",
            setor: SETORES[0],
            integracao: INTEGRACOES[0],
            supervisor: "",
            turno: TURNOS[0],
            cargo: CARGOS[0],
            data: "",
            observacao: ""
        };
    };

    function App() {
        const [formData, setFormData] = React.useState(buildDefaultFormState);

        const handleChange = function (field) {
            return function (event) {
                setFormData(function (prev) {
                    return Object.assign({}, prev, {
                        [field]: event.target.value
                    });
                });
            };
        };

        const handleSubmit = function (event) {
            event.preventDefault();

            const payload = Object.assign({}, formData, {
                matricula: formData.matricula ? parseInt(formData.matricula, 10) : null,
                data: formData.data || null
            });

            console.group("Integração submetida");
            console.table(payload);
            console.groupEnd();

            setFormData(buildDefaultFormState());
        };

        const buildOption = function (value) {
            return e("option", { value: value, key: value }, value);
        };

        return e(
            "div",
            { className: "app-container" },
            e(
                "header",
                { className: "app-header" },
                e("h1", null, "Controle de integração de colaboradores Martins"),
                e(
                    "p",
                    null,
                    "Cadastre novos colaboradores no sistema"
                )
            ),
            e(
                "main",
                { className: "form-wrapper" },
                e(
                    "form",
                    { className: "integration-form", onSubmit: handleSubmit },
                    e(
                        "div",
                        { className: "field-section-pair" },
                        e(
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
                                        value: formData.matricula,
                                        onChange: handleChange("matricula"),
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
                                        value: formData.nome,
                                        onChange: handleChange("nome"),
                                        required: true,
                                        maxLength: 120
                                    })
                                )
                            )
                        ),
                        e(
                            "section",
                            { className: "field-section" },
                            e(
                                "div",
                                { className: "field-section__header field-section__header--funcao" },
                                e(
                                    "div",
                                    { className: "icon-badge", "aria-hidden": "true" },
                                    e("span", { className: "icon-badge__glyph" }, "FL")
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
                                        renderSectionTitle("Função e localização", "funcao")
                                    ),
                                    e(
                                        "span",
                                        { className: "field-section__subtitle" },
                                        "Defina setor e cargo do colaborador"
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
                                            value: formData.setor,
                                            onChange: handleChange("setor"),
                                            required: true
                                        },
                                        SETORES.map(buildOption)
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
                                            value: formData.cargo,
                                            onChange: handleChange("cargo"),
                                            required: true
                                        },
                                        CARGOS.map(buildOption)
                                    )
                                )
                            )
                        )
                    ),
                    e(
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
                                        onChange: handleChange("turno"),
                                        required: true
                                    },
                                    TURNOS.map(buildOption)
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
                                        onChange: handleChange("integracao"),
                                        required: true
                                    },
                                    INTEGRACOES.map(buildOption)
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
                                    onChange: handleChange("supervisor"),
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
                                    onChange: handleChange("data"),
                                    required: true
                                })
                            )
                        )
                    ),
                    e(
                        "section",
                        { className: "field-section" },
                        e(
                            "div",
                            { className: "field-section__header field-section__header--observacoes" },
                            e(
                                "div",
                                { className: "icon-badge icon-badge--violet", "aria-hidden": "true" },
                                e("span", { className: "icon-badge__glyph" }, "OB")
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
                                    renderSectionTitle("Observações adicionais", "observacoes")
                                ),
                                e(
                                    "span",
                                    { className: "field-section__subtitle" },
                                    "Contextualize detalhes relevantes do colaborador"
                                )
                            )
                        ),
                        e(
                            "div",
                            { className: "field-section__grid field-section__grid--cols-1" },
                            e(
                                "label",
                                { className: "form-field", htmlFor: "observacao" },
                                renderFieldLabel("Observação", "observacao"),
                                e("textarea", {
                                    id: "observacao",
                                    placeholder: "Digite observações relevantes sobre o colaborador ou processo...",
                                    value: formData.observacao || "",
                                    onChange: handleChange("observacao"),
                                    maxLength: 400
                                })
                            )
                        )
                    ),
                    e(
                        "div",
                        { className: "action-bar" },
                        e(
                            "div",
                            { className: "action-buttons" },
                            e(
                                "button",
                                { type: "submit", className: "primary-button" },
                                "Salvar registro"
                            ),
                            e(
                                "button",
                                { type: "button", className: "ghost-button" },
                                "Ir para tabela"
                            )
                        ),
                        e(
                            "span",
                            { className: "action-note" },
                            "Todos os campos são obrigatórios"
                        )
                    )
                )
            )
        );
    }

    const rootElement = document.getElementById("root");
    const root = ReactDOM.createRoot(rootElement);
    root.render(e(App));
})();
