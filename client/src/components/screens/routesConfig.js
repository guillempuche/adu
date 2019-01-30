const ROOT = "app";
const DASHBOARD = "dashboard";

export default [
    {
        title: "Chats",
        path: `/${ROOT}/${DASHBOARD}/chats`,
        icon: "message"
    },
    {
        title: "Adu",
        path: `/${ROOT}/${DASHBOARD}/adu`,
        icon: "android"
    },
    {
        title: "Plugin",
        path: `/${ROOT}/${DASHBOARD}/plugin`,
        icon: "extension"
    }
    /*{
        path: "/tacos",
        component: Tacos,
        routes: [
            {
                path: "/tacos/bus",
                component: Bus
            },
            {
                path: "/tacos/cart",
                component: Cart
            }
        ]
    }*/
];
