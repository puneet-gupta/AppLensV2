module SupportCenter {
    export class TicketWorkflowCtrl {
        public static $inject: string[] = ["SupportCenterService", "$stateParams"];

        constructor(private SupportCenterService: ISupportCenterService, private $stateParams: IStateParams) {

            this.sessionsData = [];
            var self = this;
            let ticketWorkflowId = this.$stateParams.supportWorkflowId;
            let sessionHelper = new SessionHelper();

            this.SupportCenterService.getTicketWorflowData(ticketWorkflowId).then(function (data: SupportCenterTicketWorkflowData) {
                self.ticketWorflowData = data;

                _.each(self.ticketWorflowData.Sessions, function (session) {

                    var eventUIModel: any = [];
                    _.forEach(session.Events, function (item) {
                        eventUIModel.push(sessionHelper.GetUIModelForEvent(item));
                    });

                    self.sessionsData.push({
                        sessionData: session,
                        uiModel: eventUIModel
                    });
                });
            });
        }

        public ticketWorflowData: SupportCenterTicketWorkflowData;
        public sessionsData: any;
    }
}