"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CONFIG = void 0;
const params_1 = require("firebase-functions/params");
const rpIdParam = (0, params_1.defineString)("RP_ID", { default: "localhost" });
const originsParam = (0, params_1.defineList)("EXPECTED_ORIGINS", {
    default: [
        "http://localhost:5002", "http://127.0.0.1:5002",
        "http://localhost:5001", "http://127.0.0.1:5001",
        "http://localhost:8081", "http://127.0.0.1:8081",
        "http://localhost:8081/", "http://127.0.0.1:8081/"
    ]
});
const guestDomainParam = (0, params_1.defineString)("GUEST_DID_DOMAIN", { default: "srn.example" });
const expirationDaysParam = (0, params_1.defineInt)("GUEST_DID_EXPIRATION_DAYS", { default: 30 });
const uvParam = (0, params_1.defineBoolean)("REQUIRE_USER_VERIFICATION", { default: false });
exports.CONFIG = {
    get RP_ID() { return rpIdParam.value(); },
    get EXPECTED_ORIGINS() { return originsParam.value(); },
    get GUEST_DID_DOMAIN() { return guestDomainParam.value(); },
    get GUEST_DID_EXPIRATION_DAYS() { return expirationDaysParam.value(); },
    get REQUIRE_USER_VERIFICATION() { return uvParam.value(); }
};
//# sourceMappingURL=config.js.map