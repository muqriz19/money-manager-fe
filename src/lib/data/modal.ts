export interface ModalConfig {
    head: {
        title: string;
    },
    body: {
        component: any;
        props?: any;
    },
    foot: {
        cancel?: {

        },
        execute?: {
            hideModal: boolean;
            command?: ModalAction;
        }
    }
}

type ModalAction = () => any;