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

    const TABLE_DEFINITIONS = {
        integration: {
            id: "integration",
            label: "Integrações",
            endpoint: "/api/integration/records",
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
                }
            ]
        },
        occurrence: {
            id: "occurrence",
            label: "Ocorrências",
            endpoint: "/api/occurrence/records",
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

        React.useEffect(
            function () {
                setPage(1);
                setSortDescriptor(null);
                setSearchTerm("");
                setDebouncedSearch("");
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
                setPage(1);
            },
            [debouncedSearch, dataset, sortDescriptor ? sortDescriptor.field : null, sortDescriptor ? sortDescriptor.direction : null]
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
            [definition, page, debouncedSearch, sortDescriptor ? sortDescriptor.field : null, sortDescriptor ? sortDescriptor.direction : null]
        );

        const handleDatasetChange = function (nextDataset) {
            if (props.onDatasetChange && nextDataset !== dataset) {
                props.onDatasetChange(nextDataset);
            }
        };

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
                            definition.columns.map(function (column) {
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
                            ? e(SkeletonBody, { columns: definition.columns })
                            : error
                            ? e(TablePlaceholderRow, { columns: definition.columns }, error)
                            : state.items.length === 0
                            ? e(TablePlaceholderRow, { columns: definition.columns }, definition.emptyMessage)
                            : state.items.map(function (item) {
                                  return e(
                                      "tr",
                                      { key: dataset + "-row-" + item.id, className: "data-table__row" },
                                      definition.columns.map(function (column) {
                                          const rawValue = item[column.key];
                                          const hasValue = rawValue !== null && rawValue !== undefined && rawValue !== "";
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
