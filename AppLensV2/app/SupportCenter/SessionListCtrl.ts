module SupportCenter {
    export class SessionListCtrl {
        public static $inject: string[] = ["SupportCenterService", "$state"];
        
        constructor(private SupportCenterService: ISupportCenterService, private $state: angular.ui.IStateService) {

            this.workflowsPerDay = {};
            var self = this;
            this.SupportCenterService.dataPromise.then(function (data: any) {
                self.workflowList = self.SupportCenterService.supportCenterWorkflowList;

                _.forEach(self.workflowList, function (item) {
                    let date = new Date(item.Timestamp);
                    let dateString = `${date.getUTCMonth() + 1}/${date.getUTCDate()}/${date.getUTCFullYear()}`;
                    if (!angular.isDefined(self.workflowsPerDay[dateString])) {
                        self.workflowsPerDay[dateString] = [];
                    }

                    self.workflowsPerDay[dateString].push(item);
                });
            });
        }

        public workflowList: SupportCenterTicketWorkflowData[];
        public workflowsPerDay: ICache<SupportCenterTicketWorkflowData[]>;

        AnalyzeSession(item: SupportCenterTicketWorkflowData) {

            if (this.$state.current.name.indexOf('stampsites') >= 0) {
                if (item.TicketWorkflowId) {
                    this.$state.go('stampsites.supportworkflow', { supportWorkflowId: item.TicketWorkflowId });
                }
                else {
                    this.$state.go('stampsites.supportsession', { supportSessionId: item.Sessions[0].SessionId });
                }
            }
            else {
                if (item.TicketWorkflowId) {
                    this.$state.go('sites.supportworkflow', { supportWorkflowId: item.TicketWorkflowId });
                }
                else {
                    this.$state.go('sites.supportsession', { supportSessionId: item.Sessions[0].SessionId });
                }
            }
        }
    }
}