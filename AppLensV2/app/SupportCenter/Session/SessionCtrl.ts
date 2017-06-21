module SupportCenter {
    export class SessionCtrl {
        public static $inject: string[] = ["SupportCenterService", "$stateParams"];

        constructor(private SupportCenterService: ISupportCenterService, private $stateParams: IStateParams) {

            this.eventsUIModel = [];
            var self = this;
            let sessionId = this.$stateParams.supportSessionId;
            let sessionHelper = new SessionHelper();

            this.SupportCenterService.getSessionData(sessionId).then(function (data: SupportCenterSessionData) {
                self.sessionData = data;

                _.forEach(self.sessionData.Events, function (item) {
                    self.eventsUIModel.push(sessionHelper.GetUIModelForEvent(item));
                });
            });
        }

        public sessionData: SupportCenterSessionData;
        public eventsUIModel: any;
    }
}