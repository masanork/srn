use serde::{Deserialize, Serialize};
use thiserror::Error;

#[derive(Debug, Error)]
pub enum ValidationError {
    #[error("Invalid certificate pattern: {0}")]
    InvalidPattern(String),
    #[error("Missing required field: {0}")]
    MissingField(String),
}

/// Legal patterns for Juminhyo (Patterned VC)
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum JuminhyoPattern {
    /// 全員・本籍あり (Full Household with Honseki)
    HouseholdFull,
    /// 全員・本籍なし (Full Household without Honseki)
    HouseholdBasic,
    /// 本人のみ・本籍あり (Individual with Honseki)
    IndividualFull,
    /// 本人のみ・本籍なし (Individual without Honseki)
    IndividualBasic,
}

impl JuminhyoPattern {
    /// Validate if a set of fields matches the pattern
    pub fn validate_fields(&self, fields: &JuminhyoAttributes) -> Result<(), ValidationError> {
        match self {
            JuminhyoPattern::HouseholdFull => {
                if fields.honseki.is_none() {
                    return Err(ValidationError::MissingField("honseki".to_string()));
                }
                // Mock: Logic to check if household members are present
            }
            JuminhyoPattern::HouseholdBasic => {
                if fields.honseki.is_some() {
                    return Err(ValidationError::InvalidPattern("Honseki must be omitted".to_string()));
                }
            }
            JuminhyoPattern::IndividualFull => {
                if fields.honseki.is_none() {
                    return Err(ValidationError::MissingField("honseki".to_string()));
                }
            }
            JuminhyoPattern::IndividualBasic => {
                if fields.honseki.is_some() {
                    return Err(ValidationError::InvalidPattern("Honseki must be omitted".to_string()));
                }
            }
        }
        Ok(())
    }
}

/// Data structure for the Juminhyo VC
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct JuminhyoAttributes {
    pub name: String,
    pub address: String,
    pub birth_date: String,
    pub sex: String, // Note: ISO 5218 or text? Keeping text for now.
    pub honseki: Option<String>,
    pub my_number: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct JuminhyoVc {
    pub id: String,
    pub pattern: JuminhyoPattern,
    pub credential_subject: JuminhyoAttributes,
}

#[cfg(test)]
mod tests {
    use super::*;

    fn create_attrs(honseki: Option<&str>) -> JuminhyoAttributes {
        JuminhyoAttributes {
            name: "Taro".to_string(),
            address: "Tokyo".to_string(),
            birth_date: "2000-01-01".to_string(),
            sex: "M".to_string(),
            honseki: honseki.map(|s| s.to_string()),
            my_number: None,
        }
    }

    #[test]
    fn test_household_full_requires_honseki() {
        let pattern = JuminhyoPattern::HouseholdFull;
        let valid = create_attrs(Some("Tokyo"));
        let invalid = create_attrs(None);

        assert!(pattern.validate_fields(&valid).is_ok());
        assert!(matches!(pattern.validate_fields(&invalid), Err(ValidationError::MissingField(_))));
    }

    #[test]
    fn test_household_basic_rejects_honseki() {
        let pattern = JuminhyoPattern::HouseholdBasic;
        let valid = create_attrs(None);
        let invalid = create_attrs(Some("Tokyo"));

        assert!(pattern.validate_fields(&valid).is_ok());
        assert!(matches!(pattern.validate_fields(&invalid), Err(ValidationError::InvalidPattern(_))));
    }
}
