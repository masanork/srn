#[cfg(not(target_arch = "wasm32"))]
use clap::{Parser, Subcommand};
#[cfg(not(target_arch = "wasm32"))]
use jpki::{JpkiController, PcscReader};
#[cfg(not(target_arch = "wasm32"))]
use std::fs;

#[cfg(not(target_arch = "wasm32"))]
#[derive(Parser)]
#[command(name = "jpki")]
#[command(about = "JPKI CLI Tool", long_about = None)]
struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[cfg(not(target_arch = "wasm32"))]
#[derive(Subcommand)]
enum Commands {
    /// Show card info
    Info,
    /// Read certificate
    Cert {
        /// Type: auth (sign not fully supported yet)
        #[arg(short, long, default_value = "auth")]
        type_: String,
        /// Output file (optional, prints to stdout hex if missing)
        #[arg(short, long)]
        output: Option<String>,
    },
    /// Sign data (using Auth key)
    Sign {
        /// PIN (can also be set via JPKI_PIN env var)
        #[arg(short, long, env = "JPKI_PIN")]
        pin: String,
        /// Data to sign (string)
        #[arg(short, long)]
        data: String,
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

    let mut controller = JpkiController::new(reader);
    controller.select_jpki_ap().await?;
    println!("JPKI AP Selected");

    match cli.command {
        Commands::Info => {
            println!("Card is ready.");
        }
        Commands::Cert { type_, output } => {
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
        Commands::Sign { pin, data } => {
            let ef_pin = [0x00, 0x18]; // Auth PIN EF
            println!("Verifying PIN...");
            controller.verify_pin(&ef_pin, &pin).await?;
            println!("PIN Verified.");

            let signature = controller.compute_signature(data.as_bytes()).await?;
            println!("Signature: {}", hex::encode(signature));
        }
    }

    Ok(())
}

#[cfg(target_arch = "wasm32")]
fn main() {
    panic!("This CLI is not supported on WASM targets");
}
