#[cfg(not(target_arch = "wasm32"))]
use clap::{Parser, Subcommand};
#[cfg(not(target_arch = "wasm32"))]
use civ::{JpkiController, DriversLicenseController, PassportController, ResidenceCardController, PcscReader};
#[cfg(not(target_arch = "wasm32"))]
use std::fs;

#[cfg(not(target_arch = "wasm32"))]
#[derive(Parser)]
#[command(name = "civ")]
#[command(about = "CIV (Citizen Identity Verification) CLI Tool", long_about = None)]
struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[cfg(not(target_arch = "wasm32"))]
#[derive(Subcommand)]
enum Commands {
    /// JPKI (My Number Card) Operations
    #[command(name = "jpki")]
    Jpki {
        #[command(subcommand)]
        command: JpkiCommands,
    },
    /// Driver's License Operations
    #[command(name = "dl")]
    DriverLicense {
        /// Type: info, common
        #[arg(short, long, default_value = "info")]
        command: String,
        /// PIN1 (4 digits)
        #[arg(short, long, env = "DL_PIN1")]
        pin1: Option<String>,
    },
    /// Passport Operations
    #[command(name = "ep")]
    Passport,
    /// Residence Card Operations
    #[command(name = "rc")]
    ResidenceCard,
}

#[cfg(not(target_arch = "wasm32"))]
#[derive(Subcommand)]
enum JpkiCommands {
    /// Show card info
    #[command(name = "info")]
    Info,
    /// Read certificate
    #[command(name = "cert")]
    Cert {
        /// Type: auth (sign not fully supported yet)
        #[arg(short, long, default_value = "auth")]
        type_: String,
        /// Output file (optional, prints to stdout hex if missing)
        #[arg(short, long)]
        output: Option<String>,
    },
    /// Sign data (using Auth key)
    #[command(name = "sign")]
    Sign {
        /// PIN (can also be set via JPKI_PIN env var)
        #[arg(short, long, env = "JPKI_PIN")]
        pin: String,
        /// Data to sign (string)
        #[arg(short, long)]
        data: String,
    },
    /// Read My Number (Individual Number)
    #[command(name = "num")]
    Mynumber {
        /// PIN (4 digits for Card Surface Input Support)
        #[arg(short, long, env = "JPKI_PIN")]
        pin: String,
    },
    /// Read Card Attributes (Basic 4 Info: Name, Address, DOB, Gender)
    #[command(name = "attr")]
    Card {
        /// PIN (4 digits for Card Surface Input Support)
        #[arg(short, long, env = "JPKI_PIN")]
        pin: String,
    }
}

#[cfg(not(target_arch = "wasm32"))]
#[tokio::main]
async fn main() -> anyhow::Result<()> {
    let cli = Cli::parse();

    let mut reader = PcscReader::new()?;
    // Retry logic could be added here
    let reader_name = reader.connect()?;
    println!("Connected to reader: {}", reader_name);

    match cli.command {
        Commands::Jpki { command } => {
            let mut controller = JpkiController::new(reader);
            match command {
                JpkiCommands::Info => {
                    controller.select_jpki_ap().await?;
                    println!("JPKI AP Selected");
                    println!("Card is ready.");
                }
                JpkiCommands::Cert { type_, output } => {
                    controller.select_jpki_ap().await?;
                    if type_ != "auth" {
                        eprintln!("Only 'auth' certificate is supported in this version.");
                        return Ok(());
                    }
                    println!("Reading Auth certificate...");
                    let cert_data = controller.read_auth_cert().await?;
                    
                    if let Some(path) = output {
                        fs::write(&path, &cert_data)?;
                        println!("Certificate saved to {}", path);
                    } else {
                        println!("Certificate (Hex): {}", hex::encode(&cert_data));
                    }
                }
                JpkiCommands::Sign { pin, data } => {
                    controller.select_jpki_ap().await?;
                    let ef_pin = [0x00, 0x18]; // Auth PIN EF
                    println!("Verifying PIN...");
                    controller.verify_pin(&ef_pin, &pin).await?;
                    println!("PIN Verified.");
        
                    let signature = controller.compute_signature(data.as_bytes()).await?;
                    println!("Signature: {}", hex::encode(signature));
                }
                JpkiCommands::Mynumber { pin } => {
                    println!("Reading My Number...");
                    // select_input_support_ap is called inside read_mynumber
                    let my_number = controller.read_mynumber(&pin).await?;
                    println!("My Number: {}", my_number);
                }
                JpkiCommands::Card { pin } => {
                    println!("Reading Card Attributes...");
                    let info = controller.read_attributes(&pin).await?;
                    println!("{}", info);
                }
            }
        }
        Commands::DriverLicense { command, pin1 } => {
            let mut controller = DriversLicenseController::new(reader);
            controller.select_dl_ap().await?;
            println!("Driver's License AP Selected");
            
            if command == "common" {
                if let Some(p) = pin1 {
                    controller.verify_pin1(&p).await?;
                    println!("PIN1 Verified");
                    let data = controller.read_common_data().await?;
                    println!("Common Data (Hex): {}", hex::encode(&data));
                    // TODO: Parse standard format
                } else {
                    eprintln!("PIN1 is required for common data");
                }
            } 
        }
        Commands::Passport => {
            let mut controller = PassportController::new(reader);
            controller.select_ep_ap().await?;
            println!("Passport AP Selected");
            println!("Note: MRZ (BAC/PACE) required for reading data - not implemented in CLI yet.");
        }
        Commands::ResidenceCard => {
            let mut controller = ResidenceCardController::new(reader);
            controller.select_rc_ap().await?;
            println!("Residence Card AP Selected");
        }
    }

    Ok(())
}

#[cfg(target_arch = "wasm32")]
fn main() {
    panic!("This CLI is not supported on WASM targets");
}
