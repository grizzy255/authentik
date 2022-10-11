import "@goauthentik/admin/admin-overview/TopApplicationsTable";
import "@goauthentik/admin/admin-overview/cards/AdminStatusCard";
import "@goauthentik/admin/admin-overview/cards/SystemStatusCard";
import "@goauthentik/admin/admin-overview/cards/VersionStatusCard";
import "@goauthentik/admin/admin-overview/cards/WorkerStatusCard";
import "@goauthentik/admin/admin-overview/charts/FlowStatusChart";
import "@goauthentik/admin/admin-overview/charts/GroupCountStatusChart";
import "@goauthentik/admin/admin-overview/charts/LDAPSyncStatusChart";
import "@goauthentik/admin/admin-overview/charts/OutpostStatusChart";
import "@goauthentik/admin/admin-overview/charts/PolicyStatusChart";
import "@goauthentik/admin/admin-overview/charts/UserCountStatusChart";
import { me } from "@goauthentik/common/users";
import { AKElement } from "@goauthentik/elements/Base";
import "@goauthentik/elements/PageHeader";
import "@goauthentik/elements/cards/AggregatePromiseCard";
import "@goauthentik/elements/charts/AdminLoginsChart";
import { paramURL } from "@goauthentik/elements/router/RouterOutlet";

import { t } from "@lingui/macro";

import { CSSResult, TemplateResult, css, html } from "lit";
import { customElement } from "lit/decorators.js";
import { until } from "lit/directives/until.js";

import AKGlobal from "@goauthentik/common/styles/authentik.css";
import PFContent from "@patternfly/patternfly/components/Content/content.css";
import PFList from "@patternfly/patternfly/components/List/list.css";
import PFPage from "@patternfly/patternfly/components/Page/page.css";
import PFGrid from "@patternfly/patternfly/layouts/Grid/grid.css";

@customElement("ak-admin-overview")
export class AdminOverviewPage extends AKElement {
    static get styles(): CSSResult[] {
        return [
            PFGrid,
            PFPage,
            PFContent,
            PFList,
            AKGlobal,
            css`
                .row-divider {
                    margin-top: -4px;
                    margin-bottom: -4px;
                }
                .graph-container {
                    height: 20em;
                }
                .big-graph-container {
                    height: 35em;
                }
                .card-container {
                    max-height: 10em;
                }
            `,
        ];
    }

    render(): TemplateResult {
        return html`<ak-page-header icon="" header="" description=${t`General system status`}>
                <span slot="header">
                    ${until(
                        me().then((user) => {
                            let name = user.user.username;
                            if (user.user.name !== "") {
                                name = user.user.name;
                            }
                            return t`Welcome, ${name}.`;
                        }),
                    )}
                </span>
            </ak-page-header>
            <section class="pf-c-page__main-section">
                <div class="pf-l-grid pf-m-gutter">
                    <!-- row 1 -->
                    <div
                        class="pf-l-grid__item pf-m-6-col pf-m-4-col-on-xl pf-m-2-col-on-2xl graph-container"
                    >
                        <ak-aggregate-card
                            icon="fa fa-share"
                            header=${t`Quick actions`}
                            .isCenter=${false}
                        >
                            <ul class="pf-c-list">
                                <li>
                                    <a
                                        class="pf-u-mb-xl"
                                        href=${paramURL("/core/applications", {
                                            createForm: true,
                                        })}
                                        >${t`Create a new application`}</a
                                    >
                                </li>
                                <li>
                                    <a class="pf-u-mb-xl" href=${paramURL("/events/log")}
                                        >${t`Check the logs`}</a
                                    >
                                </li>
                                <li>
                                    <a
                                        class="pf-u-mb-xl"
                                        target="_blank"
                                        href="https://goauthentik.io/integrations/"
                                        >${t`Explore integrations`}</a
                                    >
                                </li>
                            </ul>
                        </ak-aggregate-card>
                    </div>
                    <div
                        class="pf-l-grid__item pf-m-6-col pf-m-4-col-on-xl pf-m-2-col-on-2xl graph-container"
                    >
                        <ak-aggregate-card
                            icon="pf-icon pf-icon-process-automation"
                            header=${t`Flows`}
                            headerLink="#/flow/flows"
                        >
                            <ak-admin-status-chart-flow></ak-admin-status-chart-flow>
                        </ak-aggregate-card>
                    </div>
                    <div
                        class="pf-l-grid__item pf-m-6-col pf-m-4-col-on-xl pf-m-2-col-on-2xl graph-container"
                    >
                        <ak-aggregate-card
                            icon="pf-icon pf-icon-zone"
                            header=${t`Outpost status`}
                            headerLink="#/outpost/outposts"
                        >
                            <ak-admin-status-chart-outpost></ak-admin-status-chart-outpost>
                        </ak-aggregate-card>
                    </div>
                    <div
                        class="pf-l-grid__item pf-m-6-col pf-m-4-col-on-xl pf-m-2-col-on-2xl graph-container"
                    >
                        <ak-aggregate-card
                            icon="pf-icon pf-icon-user"
                            header=${t`Users`}
                            headerLink="#/identity/users"
                        >
                            <ak-admin-status-chart-user-count></ak-admin-status-chart-user-count>
                        </ak-aggregate-card>
                    </div>
                    <div
                        class="pf-l-grid__item pf-m-6-col pf-m-4-col-on-xl pf-m-2-col-on-2xl graph-container"
                    >
                        <ak-aggregate-card
                            icon="pf-icon pf-icon-users"
                            header=${t`Groups`}
                            headerLink="#/identity/groups"
                        >
                            <ak-admin-status-chart-group-count></ak-admin-status-chart-group-count>
                        </ak-aggregate-card>
                    </div>
                    <div
                        class="pf-l-grid__item pf-m-6-col pf-m-4-col-on-xl pf-m-2-col-on-2xl graph-container"
                    >
                        <ak-aggregate-card
                            icon="fa fa-sync-alt"
                            header=${t`LDAP Sync status`}
                            headerLink="#/core/sources"
                        >
                            <ak-admin-status-chart-ldap-sync></ak-admin-status-chart-ldap-sync>
                        </ak-aggregate-card>
                    </div>
                    <div class="pf-l-grid__item pf-m-12-col row-divider">
                        <hr />
                    </div>
                    <!-- row 2 -->
                    <div
                        class="pf-l-grid__item pf-m-6-col pf-m-4-col-on-md pf-m-4-col-on-xl card-container"
                    >
                        <ak-admin-status-system> </ak-admin-status-system>
                    </div>
                    <div
                        class="pf-l-grid__item pf-m-6-col pf-m-4-col-on-md pf-m-4-col-on-xl card-container"
                    >
                        <ak-admin-status-version> </ak-admin-status-version>
                    </div>
                    <div
                        class="pf-l-grid__item pf-m-6-col pf-m-4-col-on-md pf-m-4-col-on-xl card-container"
                    >
                        <ak-admin-status-card-workers> </ak-admin-status-card-workers>
                    </div>
                    <div class="pf-l-grid__item pf-m-12-col row-divider">
                        <hr />
                    </div>
                    <!-- row 3 -->
                    <div
                        class="pf-l-grid__item pf-m-12-col pf-m-6-col-on-xl pf-m-8-col-on-2xl big-graph-container"
                    >
                        <ak-aggregate-card
                            icon="pf-icon pf-icon-server"
                            header=${t`Logins over the last 24 hours`}
                        >
                            <ak-charts-admin-login></ak-charts-admin-login>
                        </ak-aggregate-card>
                    </div>
                    <div
                        class="pf-l-grid__item pf-m-12-col pf-m-6-col-on-xl pf-m-4-col-on-2xl big-graph-container"
                    >
                        <ak-aggregate-card
                            icon="pf-icon pf-icon-server"
                            header=${t`Apps with most usage`}
                        >
                            <ak-top-applications-table></ak-top-applications-table>
                        </ak-aggregate-card>
                    </div>
                </div>
            </section>`;
    }
}