(function () {
    const e = React.createElement;
    const PAGE_SIZE = 10;

    const DATE_FORMATTER = new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    });

    const DATETIME_FORMATTER = new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });

    const NUMBER_FORMATTER = new Intl.NumberFormat("pt-BR", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    });

    const formatDate = function (value) {
        if (!value) {
            return "—";
        }

        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
            return "—";
        }

        return DATE_FORMATTER.format(date);
    };

    const formatDateTime = function (value) {
        if (!value) {
            return "—";
        }

        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
            return "—";
        }

        return DATETIME_FORMATTER.format(date);
    };

    const formatNumber = function (value) {
        if (value === null || value === undefined || value === "") {
            return "—";
        }

        const numberValue = Number(value);
        if (Number.isNaN(numberValue)) {
            return "—";
        }

        return NUMBER_FORMATTER.format(numberValue);
    };

    const parseFilenameFromDisposition = function (headerValue) {
        if (!headerValue) {
            return null;
        }

        const utf8Match = headerValue.match(/filename\*\s*=\s*UTF-8''([^;]+)/i);
        if (utf8Match && utf8Match[1]) {
            try {
                return decodeURIComponent(utf8Match[1]);
            } catch (error) {
                console.warn("Não foi possível decodificar o nome do arquivo do cabeçalho.", error);
                return utf8Match[1];
            }
        }

        const asciiMatch = headerValue.match(/filename\s*=\s*"?([^";]+)"?/i);
        if (asciiMatch && asciiMatch[1]) {
            return asciiMatch[1];
        }

        return null;
    };

    const sanitizeFilenameComponent = function (value) {
        if (!value) {
            return "";
        }

        const normalized = value.normalize ? value.normalize("NFD").replace(/[\u0300-\u036f]/g, "") : value;
        const cleaned = normalized.replace(/[^a-zA-Z0-9_-]+/g, "-");
        return cleaned.replace(/^-+|-+$/g, "").toLowerCase();
    };

    const buildExportFilename = function (label) {
        const base = sanitizeFilenameComponent(label || "exportacao");
        const safeBase = base || "exportacao";
        const now = new Date();
        const pad = function (value) {
            return String(value).padStart(2, "0");
        };
        const timestamp =
            now.getFullYear().toString() +
            pad(now.getMonth() + 1) +
            pad(now.getDate()) +
            "_" +
            pad(now.getHours()) +
            pad(now.getMinutes()) +
            pad(now.getSeconds());

        return safeBase + "_" + timestamp + ".xlsx";
    };

    const buildStatusClass = function (value) {
        if (!value) {
            return "status-pill status-pill--neutral";
        }

        const normalized = String(value).toLowerCase();
        if (normalized.includes("sim") || normalized.includes("concl")) {
            return "status-pill status-pill--success";
        }
        if (normalized.includes("não") || normalized.includes("pend")) {
            return "status-pill status-pill--alert";
        }
        return "status-pill status-pill--neutral";
    };

    const buildSeverityClass = function (value) {
        if (typeof value !== "number") {
            return "severity-chip severity-chip--neutral";
        }

        if (value >= 8) {
            return "severity-chip severity-chip--critical";
        }
        if (value >= 5) {
            return "severity-chip severity-chip--warning";
        }
        if (value >= 3) {
            return "severity-chip severity-chip--caution";
        }
        return "severity-chip severity-chip--neutral";
    };

    const ObservationIcon = function (props) {
        const variant = props && props.variant === "outline" ? "outline" : "filled";
        return e(
            "svg",
            {
                className: "observation-icon observation-icon--" + variant,
                viewBox: "0 0 24 24",
                width: 20,
                height: 20,
                role: "presentation",
                focusable: "false"
            },
            variant === "outline"
                ? e("path", {
                      d: "M5 6.8c0-1.04.84-1.88 1.88-1.88h10.24A1.88 1.88 0 0119 6.8v6.06a1.88 1.88 0 01-1.88 1.88h-3.4l-2.62 2.6a.62.62 0 01-1.06-.44v-2.16H6.88A1.88 1.88 0 015 12.86V6.8z",
                      fill: "none",
                      stroke: "currentColor",
                      strokeWidth: 1.6,
                      strokeLinecap: "round",
                      strokeLinejoin: "round"
                  })
                : e("path", {
                      d: "M6.8 5h10.4A1.8 1.8 0 0119 6.8v6.1a1.8 1.8 0 01-1.8 1.8h-3.5l-3.1 3.1a.7.7 0 01-1.2-.5v-2.6H6.8A1.8 1.8 0 015 12.9V6.8A1.8 1.8 0 016.8 5z",
                      fill: "currentColor"
                  })
        );
    };

    const ObservationPopover = function (props) {
        const noteText = typeof props.text === "string" ? props.text : props.text !== null && props.text !== undefined ? String(props.text) : "";
        const normalizedNote = noteText.trim();
        const hasContent = normalizedNote.length > 0;
        const [isOpen, setIsOpen] = React.useState(false);
        const [popoverStyle, setPopoverStyle] = React.useState(null);
        const containerRef = React.useRef(null);
        const triggerRef = React.useRef(null);
        const popoverRef = React.useRef(null);
        const popoverId = React.useMemo(function () {
            return "observation-popover-" + Math.random().toString(16).slice(2);
        }, []);

        const closePopover = React.useCallback(function (shouldFocus) {
            setIsOpen(false);
            setPopoverStyle(null);
            if (shouldFocus && triggerRef.current) {
                window.requestAnimationFrame(function () {
                    if (triggerRef.current) {
                        triggerRef.current.focus();
                    }
                });
            }
        }, []);

        const updatePosition = React.useCallback(function () {
            if (!triggerRef.current || !popoverRef.current) {
                return;
            }

            const triggerRect = triggerRef.current.getBoundingClientRect();
            const popoverRect = popoverRef.current.getBoundingClientRect();
            const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
            const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
            const margin = 16;

            const minLeft = margin;
            const maxLeft = viewportWidth - margin - popoverRect.width;
            let left = triggerRect.left + triggerRect.width - popoverRect.width;
            left = Math.max(minLeft, Math.min(left, maxLeft));

            const defaultTop = triggerRect.bottom + 12;
            const maxTop = viewportHeight - margin - popoverRect.height;
            let top = Math.max(margin, Math.min(defaultTop, maxTop));

            const triggerCenter = triggerRect.left + triggerRect.width / 2;
            let arrowLeft = triggerCenter - left - 9;
            const arrowMin = 18;
            const arrowMax = Math.max(arrowMin, popoverRect.width - 18);
            arrowLeft = Math.min(Math.max(arrowLeft, arrowMin), arrowMax);

            setPopoverStyle({ top: top, left: left, arrowLeft: arrowLeft });
        }, []);

        React.useEffect(
            function () {
                if (!isOpen) {
                    return undefined;
                }

                const handlePointerDown = function (event) {
                    const containerElement = containerRef.current;
                    const popoverElement = popoverRef.current;
                    if (
                        (containerElement && containerElement.contains(event.target)) ||
                        (popoverElement && popoverElement.contains(event.target))
                    ) {
                        return;
                    }
                    closePopover(false);
                };

                const handleKeyDown = function (event) {
                    if (event.key === "Escape") {
                        event.preventDefault();
                        closePopover(true);
                    }
                };

                document.addEventListener("mousedown", handlePointerDown);
                document.addEventListener("touchstart", handlePointerDown);
                document.addEventListener("keydown", handleKeyDown);

                return function () {
                    document.removeEventListener("mousedown", handlePointerDown);
                    document.removeEventListener("touchstart", handlePointerDown);
                    document.removeEventListener("keydown", handleKeyDown);
                };
            },
            [isOpen, closePopover]
        );

        React.useEffect(
            function () {
                if (!hasContent && isOpen) {
                    setIsOpen(false);
                    setPopoverStyle(null);
                }
            },
            [hasContent, isOpen]
        );

        React.useLayoutEffect(
            function () {
                if (!isOpen || !hasContent) {
                    return undefined;
                }

                updatePosition();

                const handleReposition = function () {
                    updatePosition();
                };

                window.addEventListener("resize", handleReposition);
                window.addEventListener("scroll", handleReposition, true);

                return function () {
                    window.removeEventListener("resize", handleReposition);
                    window.removeEventListener("scroll", handleReposition, true);
                };
            },
            [isOpen, hasContent, updatePosition, normalizedNote]
        );

        const formattedTimestamp = React.useMemo(
            function () {
                if (!props.timestamp) {
                    return null;
                }
                return formatDateTime(props.timestamp);
            },
            [props.timestamp]
        );

        const handleToggle = function () {
            if (!hasContent) {
                return;
            }
            setIsOpen(function (previous) {
                const nextValue = !previous;
                if (!nextValue) {
                    setPopoverStyle(null);
                }
                return nextValue;
            });
        };

        const popoverNode = isOpen && hasContent
            ? ReactDOM.createPortal(
                  e(
                      "div",
                      {
                          className: "observation-popover",
                          role: "dialog",
                          id: popoverId,
                          "aria-modal": "false",
                          ref: popoverRef,
                          style: popoverStyle
                              ? {
                                    top: popoverStyle.top + "px",
                                    left: popoverStyle.left + "px",
                                    "--observation-arrow-left": popoverStyle.arrowLeft + "px"
                                }
                              : {
                                    top: "-9999px",
                                    left: "-9999px"
                                }
                      },
                      e(
                          "header",
                          { className: "observation-popover__header" },
                          e(
                              "span",
                              { className: "observation-popover__badge", "aria-hidden": "true" },
                              e(ObservationIcon, { variant: "filled" })
                          ),
                          e(
                              "div",
                              { className: "observation-popover__titles" },
                              e(
                                  "span",
                                  { className: "observation-popover__title" },
                                  "Observação"
                              ),
                              props.author
                                  ? e(
                                        "span",
                                        { className: "observation-popover__meta" },
                                        props.author
                                    )
                                  : null,
                              formattedTimestamp
                                  ? e(
                                        "span",
                                        {
                                            className:
                                                "observation-popover__meta observation-popover__meta--timestamp"
                                        },
                                        formattedTimestamp
                                    )
                                  : null
                          ),
                          e(
                              "button",
                              {
                                  type: "button",
                                  className: "observation-popover__close",
                                  onClick: function () {
                                      closePopover(true);
                                  },
                                  "aria-label": "Fechar observação"
                              },
                              "×"
                          )
                      ),
                      e(
                          "div",
                          { className: "observation-popover__content" },
                          e(
                              "p",
                              { className: "observation-popover__text" },
                              normalizedNote
                          )
                      )
                  ),
                  document.body
              )
            : null;

        return e(
            React.Fragment,
            null,
            e(
                "div",
                { className: "observation-widget", ref: containerRef },
                e(
                    "button",
                    {
                        type: "button",
                        className:
                            "observation-trigger" + (hasContent ? "" : " observation-trigger--empty"),
                        onClick: hasContent ? handleToggle : null,
                        disabled: !hasContent,
                        "aria-expanded": hasContent ? String(isOpen) : undefined,
                        "aria-controls": hasContent ? popoverId : undefined,
                        ref: triggerRef
                    },
                    e(
                        "span",
                        { className: "observation-trigger__icon", "aria-hidden": "true" },
                        e(ObservationIcon, { variant: hasContent ? "filled" : "outline" })
                    ),
                    e(
                        "span",
                        { className: "observation-trigger__label" },
                        hasContent ? "Ver nota" : "Sem nota"
                    )
                )
            ),
            popoverNode
        );
    };

    const renderObservationCell = function (value, item, options) {
        return e(ObservationPopover, {
            text: value,
            author: options && options.authorField && item ? item[options.authorField] : null,
            timestamp: options && options.timestampField && item ? item[options.timestampField] : null
        });
    };

    const TABLE_DEFINITIONS = {
        integration: {
            id: "integration",
            label: "Integrações",
            endpoint: "/api/integration/records",
            deleteEndpoint: "/api/integration/records",
            exportEndpoint: "/api/integration/export",
            emptyMessage: "Nenhum registro de integração encontrado.",
            defaultSort: { field: "submitted_at", direction: "desc" },
            columns: [
                { key: "id", label: "ID", width: "72px", sortable: true },
                {
                    key: "matricula",
                    label: "Matrícula",
                    width: "110px",
                    className: "table-cell--identifier",
                    sortable: true
                },
                { key: "nome", label: "Colaborador", className: "table-cell--strong", sortable: true },
                { key: "setor", label: "Setor", width: "150px", sortable: true },
                { key: "cargo", label: "Cargo", width: "160px", className: "table-cell--truncate", sortable: true },
                { key: "turno", label: "Turno", width: "120px", sortable: true },
                {
                    key: "integracao",
                    label: "Status",
                    width: "140px",
                    sortable: true,
                    render: function (value) {
                        return e(
                            "span",
                            { className: buildStatusClass(value) },
                            value || "—"
                        );
                    }
                },
                {
                    key: "supervisor",
                    label: "Supervisor",
                    width: "160px",
                    className: "table-cell--uppercase",
                    sortable: true
                },
                {
                    key: "data",
                    label: "Data integração",
                    width: "140px",
                    sortable: true,
                    render: function (value) {
                        return e("span", null, formatDate(value));
                    }
                },
                {
                    key: "submitted_at",
                    label: "Registrado em",
                    width: "170px",
                    sortable: true,
                    render: function (value) {
                        return e("span", null, formatDateTime(value));
                    }
                },
                {
                    key: "observacao",
                    label: "Observações",
                    width: "160px",
                    className: "table-cell--observacao",
                    render: function (value, item) {
                        return renderObservationCell(value, item, {
                            authorField: "nome",
                            timestampField: "submitted_at"
                        });
                    }
                }
            ]
        },
        occurrence: {
            id: "occurrence",
            label: "Ocorrências",
            endpoint: "/api/occurrence/records",
            deleteEndpoint: "/api/occurrence/records",
            exportEndpoint: "/api/occurrence/export",
            emptyMessage: "Nenhum registro de ocorrência encontrado.",
            defaultSort: { field: "created_at", direction: "desc" },
            columns: [
                { key: "id", label: "ID", width: "72px", sortable: true },
                {
                    key: "matricula",
                    label: "Matrícula",
                    width: "110px",
                    className: "table-cell--identifier",
                    sortable: true
                },
                { key: "nome", label: "Colaborador", className: "table-cell--strong", sortable: true },
                { key: "setor", label: "Setor", width: "150px", sortable: true },
                { key: "cargo", label: "Cargo", width: "160px", className: "table-cell--truncate", sortable: true },
                { key: "turno", label: "Turno", width: "120px", sortable: true },
                {
                    key: "motivo",
                    label: "Motivo",
                    width: "180px",
                    sortable: true,
                    className: "table-cell--truncate"
                },
                {
                    key: "grau_label",
                    label: "Grau",
                    width: "180px",
                    sortable: true,
                    sortKey: "grau",
                    render: function (value, item) {
                        if (!value) {
                            return e("span", { className: "table-cell--muted" }, "—");
                        }

                        const chipClass = buildSeverityClass(typeof item.grau === "number" ? item.grau : Number(item.grau));
                        return e(
                            "span",
                            { className: chipClass },
                            e("span", { className: "severity-chip__label" }, value),
                            item.grau !== null && item.grau !== undefined
                                ? e("span", { className: "severity-chip__value" }, String(item.grau))
                                : null
                        );
                    }
                },
                {
                    key: "volumes",
                    label: "Volumes",
                    width: "110px",
                    sortable: true,
                    render: function (value) {
                        return e("span", null, formatNumber(value));
                    }
                },
                {
                    key: "supervisor",
                    label: "Supervisor",
                    width: "160px",
                    className: "table-cell--uppercase",
                    sortable: true
                },
                {
                    key: "created_at",
                    label: "Registrado em",
                    width: "170px",
                    sortable: true,
                    render: function (value) {
                        return e("span", null, formatDateTime(value));
                    }
                },
                {
                    key: "observacao",
                    label: "Observações",
                    width: "160px",
                    className: "table-cell--observacao",
                    render: function (value, item) {
                        return renderObservationCell(value, item, {
                            authorField: "nome",
                            timestampField: "created_at"
                        });
                    }
                }
            ]
        }
    };

    const SkeletonBody = function (props) {
        const columnCount = props.columns.length;
        return e(
            React.Fragment,
            null,
            Array.from({ length: 6 }).map(function (_, rowIndex) {
                return e(
                    "tr",
                    { key: "skeleton-" + rowIndex, className: "data-table__row data-table__row--skeleton" },
                    Array.from({ length: columnCount }).map(function (__unused, cellIndex) {
                        return e(
                            "td",
                            { key: "skeleton-cell-" + cellIndex },
                            e("span", { className: "skeleton-block" })
                        );
                    })
                );
            })
        );
    };

    const TablePlaceholderRow = function (props) {
        return e(
            "tr",
            { className: "data-table__row" },
            e(
                "td",
                {
                    className: "data-table__placeholder",
                    colSpan: props.columns.length
                },
                props.children
            )
        );
    };

    const TableView = function (props) {
        const dataset = TABLE_DEFINITIONS[props.dataset] ? props.dataset : "integration";
        const definition = React.useMemo(
            function () {
                return TABLE_DEFINITIONS[dataset];
            },
            [dataset]
        );

        const [page, setPage] = React.useState(1);
        const [state, setState] = React.useState({
            items: [],
            totalItems: 0,
            totalPages: 1,
            pageSize: PAGE_SIZE,
            page: 1
        });
        const [loading, setLoading] = React.useState(false);
        const [error, setError] = React.useState(null);
        const [sortDescriptor, setSortDescriptor] = React.useState(function () {
            return null;
        });
        const [searchTerm, setSearchTerm] = React.useState("");
        const [debouncedSearch, setDebouncedSearch] = React.useState("");
        const [refreshToken, setRefreshToken] = React.useState(0);
        const [actionState, setActionState] = React.useState({ type: null, busyKey: null });
        const [actionFeedback, setActionFeedback] = React.useState(null);
        const [exporting, setExporting] = React.useState(false);

        React.useEffect(
            function () {
                setPage(1);
                setSortDescriptor(null);
                setSearchTerm("");
                setDebouncedSearch("");
                setExporting(false);
            },
            [dataset]
        );

        React.useEffect(
            function () {
                const handle = window.setTimeout(function () {
                    setDebouncedSearch(searchTerm.trim());
                }, 350);
                return function () {
                    window.clearTimeout(handle);
                };
            },
            [searchTerm]
        );

        React.useEffect(
            function () {
                const handleTableRefresh = function (event) {
                    const detail = event.detail || {};
                    const targetDataset = detail.dataset;

                    if (targetDataset && targetDataset !== dataset) {
                        return;
                    }

                    setRefreshToken(function (previous) {
                        return previous + 1;
                    });
                };

                window.addEventListener("table:refresh", handleTableRefresh);

                return function () {
                    window.removeEventListener("table:refresh", handleTableRefresh);
                };
            },
            [dataset]
        );

        React.useEffect(
            function () {
                setPage(1);
            },
            [debouncedSearch, dataset, sortDescriptor ? sortDescriptor.field : null, sortDescriptor ? sortDescriptor.direction : null]
        );

        React.useEffect(
            function () {
                if (!actionFeedback) {
                    return undefined;
                }

                const timeoutId = window.setTimeout(function () {
                    setActionFeedback(null);
                }, 3800);

                return function () {
                    window.clearTimeout(timeoutId);
                };
            },
            [actionFeedback]
        );

        React.useEffect(
            function () {
                let isMounted = true;
                const controller = new AbortController();

                const fetchData = async function () {
                    setLoading(true);
                    setError(null);

                    try {
                        const appliedSort = sortDescriptor || definition.defaultSort || null;

                        const params = new URLSearchParams();
                        params.set("page", String(page));
                        params.set("page_size", String(PAGE_SIZE));
                        if (appliedSort && appliedSort.field) {
                            params.set("sort_by", appliedSort.field);
                            params.set("sort_order", appliedSort.direction === "asc" ? "asc" : "desc");
                        }
                        if (debouncedSearch) {
                            params.set("search", debouncedSearch);
                        }

                        const response = await fetch(
                            definition.endpoint + "?" + params.toString(),
                            { signal: controller.signal }
                        );

                        const payload = await response.json().catch(function () {
                            return null;
                        });

                        if (!response.ok || !payload) {
                            const message = payload && payload.error ? payload.error : "Falha ao carregar os dados.";
                            throw new Error(message);
                        }

                        if (!isMounted) {
                            return;
                        }

                        const pagination = payload.pagination || {};
                        const resolvedPage = Math.max(1, Number(pagination.page) || page);
                        const resolvedSize = Math.max(1, Number(pagination.page_size) || PAGE_SIZE);
                        const totalItems = Math.max(0, Number(pagination.total_items) || 0);
                        const totalPages = Math.max(1, Number(pagination.total_pages) || Math.ceil(totalItems / resolvedSize) || 1);

                        setState({
                            items: Array.isArray(payload.items) ? payload.items : [],
                            totalItems: totalItems,
                            totalPages: totalPages,
                            pageSize: resolvedSize,
                            page: resolvedPage
                        });

                        if (resolvedPage !== page) {
                            setPage(resolvedPage);
                        }
                    } catch (err) {
                        if (!isMounted || err.name === "AbortError") {
                            return;
                        }
                        setError(err instanceof Error ? err.message : "Erro inesperado ao consultar o servidor.");
                        setState(function (previous) {
                            return Object.assign({}, previous, { items: [] });
                        });
                    } finally {
                        if (isMounted) {
                            setLoading(false);
                        }
                    }
                };

                fetchData();

                return function () {
                    isMounted = false;
                    controller.abort();
                };
            },
            [
                definition,
                page,
                debouncedSearch,
                sortDescriptor ? sortDescriptor.field : null,
                sortDescriptor ? sortDescriptor.direction : null,
                refreshToken
            ]
        );

        const handleDatasetChange = function (nextDataset) {
            if (props.onDatasetChange && nextDataset !== dataset) {
                props.onDatasetChange(nextDataset);
            }
        };

        const datasetLabel = definition.label || dataset;

        const handleEditRecord = React.useCallback(
            function (item) {
                if (!item || item.id === undefined || item.id === null) {
                    return;
                }

                window.dispatchEvent(
                    new CustomEvent("app:edit-record", {
                        detail: {
                            dataset: dataset,
                            record: item
                        }
                    })
                );
            },
            [dataset]
        );

        const handleDeleteRecord = React.useCallback(
            async function (item) {
                if (!item || item.id === undefined || item.id === null) {
                    return;
                }

                const recordId = item.id;
                const personLabel = item.nome ? " de " + String(item.nome).trim() : "";
                const actionKey = dataset + ":" + recordId;
                const readableDataset = dataset === "integration" ? "integração" : "ocorrência";
                const confirmed = window.confirm(
                    "Deseja realmente excluir a " + readableDataset + " #" + recordId + personLabel + "?"
                );

                if (!confirmed) {
                    return;
                }

                setActionState({ type: "delete", busyKey: actionKey });

                try {
                    const baseEndpoint = (definition.deleteEndpoint || definition.endpoint || "").replace(/\/$/, "");
                    const response = await fetch(baseEndpoint + "/" + encodeURIComponent(recordId), {
                        method: "DELETE"
                    });

                    const payload = await response.json().catch(function () {
                        return null;
                    });

                    if (!response.ok) {
                        const message = payload && payload.error ? payload.error : "Não foi possível remover o registro.";
                        throw new Error(message);
                    }

                    setActionFeedback({
                        type: "success",
                        message: (datasetLabel || "Registro") + " #" + recordId + " removido com sucesso."
                    });

                    window.dispatchEvent(
                        new CustomEvent("table:refresh", {
                            detail: { dataset: dataset }
                        })
                    );
                } catch (error) {
                    const message = error instanceof Error && error.message
                        ? error.message
                        : "Erro inesperado ao remover o registro.";
                    console.error(error);
                    setActionFeedback({ type: "error", message: message });
                } finally {
                    setActionState({ type: null, busyKey: null });
                }
            },
            [dataset, datasetLabel, definition]
        );

        const renderActionCell = React.useCallback(
            function (item) {
                const recordId = item && item.id !== undefined && item.id !== null ? item.id : null;
                const actionKey = recordId !== null ? dataset + ":" + recordId : null;
                const isBusy = actionKey && actionState.busyKey === actionKey;
                const isDeleteBusy = isBusy && actionState.type === "delete";

                return e(
                    "div",
                    { className: "table-actions" },
                    e(
                        "button",
                        {
                            type: "button",
                            className: "table-action-button table-action-button--edit",
                            onClick: function () {
                                handleEditRecord(item);
                            },
                            disabled: !recordId || isBusy,
                            "aria-label":
                                recordId !== null
                                    ? "Editar registro #" + recordId
                                    : "Editar registro"
                        },
                        e("i", { className: "fi-rr-edit", "aria-hidden": "true" })
                    ),
                    e(
                        "button",
                        {
                            type: "button",
                            className:
                                "table-action-button table-action-button--delete" +
                                (isDeleteBusy ? " table-action-button--loading" : ""),
                            onClick: function () {
                                handleDeleteRecord(item);
                            },
                            disabled: !recordId || isBusy,
                            "aria-label":
                                recordId !== null
                                    ? "Excluir registro #" + recordId
                                    : "Excluir registro"
                        },
                        e("i", { className: "fi-rr-trash", "aria-hidden": "true" })
                    )
                );
            },
            [dataset, actionState, handleEditRecord, handleDeleteRecord]
        );

        const columns = React.useMemo(
            function () {
                const baseColumns = Array.isArray(definition.columns) ? definition.columns.slice() : [];

                baseColumns.unshift({
                    key: "__actions",
                    label: "Ação",
                    width: "120px",
                    className: "table-cell--actions",
                    forceContentVisibility: true,
                    sortable: false,
                    render: function (_value, item) {
                        return renderActionCell(item);
                    }
                });

                return baseColumns;
            },
            [definition, renderActionCell]
        );

        const handleSortChange = function (sortField) {
            setSortDescriptor(function (previous) {
                if (!previous || previous.field !== sortField) {
                    return { field: sortField, direction: "asc" };
                }
                if (previous.direction === "asc") {
                    return { field: sortField, direction: "desc" };
                }
                return null;
            });
        };

        const handleSearchChange = function (event) {
            setSearchTerm(event.target.value);
        };

        const handlePreviousPage = function () {
            if (state.page > 1) {
                setPage(state.page - 1);
            }
        };

        const handleNextPage = function () {
            if (state.page < state.totalPages) {
                setPage(state.page + 1);
            }
        };

        const handleExport = React.useCallback(
            async function () {
                if (!definition.exportEndpoint) {
                    setActionFeedback({
                        type: "error",
                        message: "Exportação não disponível para este conjunto de dados."
                    });
                    return;
                }

                if (exporting) {
                    return;
                }

                const appliedSort = sortDescriptor || definition.defaultSort || null;
                const params = new URLSearchParams();
                if (appliedSort && appliedSort.field) {
                    params.set("sort_by", appliedSort.field);
                    params.set("sort_order", appliedSort.direction === "asc" ? "asc" : "desc");
                }
                if (debouncedSearch) {
                    params.set("search", debouncedSearch);
                }

                const endpoint = definition.exportEndpoint.replace(/\/$/, "");
                const url = params.toString() ? endpoint + "?" + params.toString() : endpoint;

                setExporting(true);

                try {
                    const response = await fetch(url, { method: "GET" });
                    if (!response.ok) {
                        const errorPayload = await response.json().catch(function () {
                            return null;
                        });
                        const message = errorPayload && errorPayload.error
                            ? errorPayload.error
                            : "Não foi possível gerar o arquivo de exportação.";
                        throw new Error(message);
                    }

                    const blob = await response.blob();
                    if (!blob || blob.size === 0) {
                        throw new Error("O arquivo de exportação retornou vazio.");
                    }

                    const disposition = response.headers.get("Content-Disposition");
                    const headerFilename = parseFilenameFromDisposition(disposition);
                    const fallbackFilename = buildExportFilename(datasetLabel);
                    const filename = headerFilename || fallbackFilename;

                    const objectUrl = window.URL.createObjectURL(blob);
                    const link = document.createElement("a");
                    link.href = objectUrl;
                    link.download = filename;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    window.URL.revokeObjectURL(objectUrl);

                    setActionFeedback({
                        type: "success",
                        message: "Exportação concluída. Arquivo " + filename + " gerado"
                    });
                } catch (error) {
                    console.error(error);
                    const message = error instanceof Error && error.message
                        ? error.message
                        : "Falha inesperada ao exportar os dados.";
                    setActionFeedback({ type: "error", message: message });
                } finally {
                    setExporting(false);
                }
            },
            [definition, sortDescriptor, debouncedSearch, datasetLabel, exporting]
        );

        const rangeStart = state.totalItems ? (state.page - 1) * state.pageSize + 1 : 0;
        const rangeEnd = state.totalItems ? Math.min(state.page * state.pageSize, state.totalItems) : 0;
        const appliedSort = sortDescriptor || definition.defaultSort || null;
        const isFiltering = Boolean(debouncedSearch);

        return e(
            "section",
            { className: "table-view" },
            e(
                "header",
                { className: "table-toolbar" },
                e(
                    "div",
                    { className: "table-toolbar__left" },
                    e(
                        "div",
                        { className: "dataset-switch" },
                        Object.keys(TABLE_DEFINITIONS).map(function (key) {
                            const option = TABLE_DEFINITIONS[key];
                            const isActive = option.id === dataset;
                            return e(
                                "button",
                                {
                                    key: option.id,
                                    type: "button",
                                    className: "dataset-pill" + (isActive ? " dataset-pill--active" : ""),
                                    onClick: function () {
                                        if (!loading) {
                                            handleDatasetChange(option.id);
                                        }
                                    },
                                    "aria-pressed": isActive,
                                    disabled: loading && isActive
                                },
                                option.label
                            );
                        })
                    )
                ),
                e(
                    "div",
                    { className: "table-toolbar__center" },
                    e(
                        "div",
                        { className: "table-search" },
                        e("span", { className: "table-search__icon", "aria-hidden": "true" }),
                        e("input", {
                            className: "table-search__input",
                            type: "search",
                            placeholder: "Filtrar por nome, matrícula ou setor",
                            value: searchTerm,
                            onChange: handleSearchChange,
                            disabled: loading,
                            autoComplete: "off",
                            spellCheck: "false",
                            "aria-label": "Filtrar registros"
                        })
                    )
                ),
                e(
                    "div",
                    { className: "table-toolbar__right" },
                    e(
                        "button",
                        {
                            type: "button",
                            className:
                                "table-export-button" +
                                (exporting ? " table-export-button--loading" : ""),
                            onClick: handleExport,
                            disabled: loading || exporting,
                            title: "Exportar registros para Excel",
                            "aria-busy": exporting ? "true" : undefined
                        },
                        e("i", { className: "fi-rr-download", "aria-hidden": "true" }),
                        e(
                            "span",
                            { className: "table-export-button__label" },
                            exporting ? "Gerando arquivo..." : "Exportar para Excel"
                        )
                    ),
                    e(
                        "div",
                        { className: "table-metrics" + (isFiltering ? " table-metrics--filtered" : "") },
                        e(
                            "span",
                            { className: "table-metrics__range" },
                            state.totalItems
                                ? "Exibindo " + rangeStart + "-" + rangeEnd + " de " + state.totalItems + " registros" + (isFiltering ? " filtrados" : "")
                                : isFiltering
                                ? "Nenhum registro encontrado para o filtro aplicado"
                                : "Nenhum registro disponível"
                        )
                    )
                )
            ),
            actionFeedback
                ? e(
                      "div",
                      {
                          className:
                              "table-feedback table-feedback--" + (actionFeedback.type || "info"),
                          role: "status"
                      },
                      actionFeedback.message
                  )
                : null,
            e(
                "div",
                { className: "table-surface" },
                e(
                    "table",
                    { className: "data-table" },
                    e(
                        "thead",
                        null,
                        e(
                            "tr",
                            { className: "data-table__head-row" },
                            columns.map(function (column) {
                                const sortField = column.sortKey || column.key;
                                const isSortable = column.sortable !== false && Boolean(sortField);
                                const isSorted = Boolean(
                                    isSortable && appliedSort && appliedSort.field === sortField
                                );
                                const sortDirection = isSorted
                                    ? appliedSort.direction === "asc"
                                        ? "asc"
                                        : "desc"
                                    : "none";
                                const sortIconClass =
                                    "data-table__sort-icon data-table__sort-icon--" + sortDirection;
                                const thProps = {
                                    key: column.key,
                                    scope: "col",
                                    style: column.width ? { width: column.width } : undefined,
                                    className: column.headerClass || "",
                                    "aria-sort": isSorted
                                        ? appliedSort.direction === "asc"
                                            ? "ascending"
                                            : "descending"
                                        : "none"
                                };

                                if (!isSortable) {
                                    return e(
                                        "th",
                                        thProps,
                                        e(
                                            "span",
                                            { className: "data-table__head-label" },
                                            column.label,
                                            isFiltering
                                                ? e("span", {
                                                      className: "data-table__filter-icon",
                                                      "aria-hidden": "true"
                                                  })
                                                : null
                                        )
                                    );
                                }

                                return e(
                                    "th",
                                    thProps,
                                    e(
                                        "button",
                                        {
                                            type: "button",
                                            className:
                                                "data-table__head-button" + (isSorted ? " is-active" : ""),
                                            onClick: function () {
                                                handleSortChange(sortField);
                                            },
                                            disabled: loading
                                        },
                                        e(
                                            "span",
                                            { className: "data-table__head-label" },
                                            column.label
                                        ),
                                        isFiltering
                                            ? e("span", {
                                                  className: "data-table__filter-icon",
                                                  "aria-hidden": "true"
                                              })
                                            : null,
                                        e("span", { className: sortIconClass, "aria-hidden": "true" })
                                    )
                                );
                            })
                        )
                    ),
                    e(
                        "tbody",
                        null,
                        loading
                            ? e(SkeletonBody, { columns: columns })
                            : error
                            ? e(TablePlaceholderRow, { columns: columns }, error)
                            : state.items.length === 0
                            ? e(TablePlaceholderRow, { columns: columns }, definition.emptyMessage)
                            : state.items.map(function (item) {
                                  return e(
                                      "tr",
                                      { key: dataset + "-row-" + item.id, className: "data-table__row" },
                                      columns.map(function (column) {
                                          const rawValue = item[column.key];
                                              const hasValue = column.forceContentVisibility
                                                  ? true
                                                  : rawValue !== null && rawValue !== undefined && rawValue !== "";
                                          const content = column.render
                                              ? column.render(rawValue, item)
                                              : hasValue
                                              ? rawValue
                                              : "—";
                                          const cellClass = [
                                              column.className || "",
                                              hasValue ? "" : "table-cell--muted"
                                          ]
                                              .filter(Boolean)
                                              .join(" ");

                                          return e(
                                              "td",
                                              {
                                                  key: column.key,
                                                  className: cellClass,
                                                  style: column.width ? { width: column.width } : undefined
                                              },
                                              content
                                          );
                                      })
                                  );
                              })
                    )
                )
            ),
            e(
                "footer",
                { className: "table-pagination" },
                e(
                    "div",
                    { className: "table-pagination__controls" },
                    e(
                        "button",
                        {
                            type: "button",
                            className: "table-pagination__button",
                            onClick: handlePreviousPage,
                            disabled: loading || state.page <= 1
                        },
                        "Anterior"
                    ),
                    e(
                        "span",
                        { className: "table-pagination__status" },
                        "Página " + state.page + " de " + state.totalPages
                    ),
                    e(
                        "button",
                        {
                            type: "button",
                            className: "table-pagination__button",
                            onClick: handleNextPage,
                            disabled: loading || state.page >= state.totalPages
                        },
                        "Próxima"
                    )
                )
            )
        );
    };

    window.AppTableView = {
        Component: TableView
    };
})();
