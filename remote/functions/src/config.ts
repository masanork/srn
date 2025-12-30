import { defineString, defineList, defineInt, defineBoolean } from "firebase-functions/params";

const rpIdParam = defineString("RP_ID", { default: "localhost" });
const originsParam = defineList("EXPECTED_ORIGINS", {
    default: [
        "http://localhost:5002", "http://127.0.0.1:5002",
        "http://localhost:5001", "http://127.0.0.1:5001",
        "http://localhost:8081", "http://127.0.0.1:8081",
        "http://localhost:8081/", "http://127.0.0.1:8081/"
    ]
});
const guestDomainParam = defineString("GUEST_DID_DOMAIN", { default: "srn.example" });
const expirationDaysParam = defineInt("GUEST_DID_EXPIRATION_DAYS", { default: 30 });
const uvParam = defineBoolean("REQUIRE_USER_VERIFICATION", { default: false });

const adminDidsParam = defineList("ADMIN_DIDS", { default: [] });

export const CONFIG = {
    get RP_ID() { return rpIdParam.value(); },
    get EXPECTED_ORIGINS() { return originsParam.value(); },
    get GUEST_DID_DOMAIN() { return guestDomainParam.value(); },
    get GUEST_DID_EXPIRATION_DAYS() { return expirationDaysParam.value(); },
    get REQUIRE_USER_VERIFICATION() { return uvParam.value(); },
    get ADMIN_DIDS() { return adminDidsParam.value(); }
};
