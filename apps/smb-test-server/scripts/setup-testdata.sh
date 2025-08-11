#!/bin/sh

# Setup script to create test data structure
# Run this to generate the test files and folders

echo "Setting up SMB test data structure..."

# Base directory for test data
BASE_DIR="/shares"

# Create base directory
mkdir -p "$BASE_DIR"

# Function to create sample files
create_sample_files() {
    local dir=$1
    local prefix=$2
    
    # Create text files
    echo "This is a sample text file in $prefix" > "$dir/${prefix}_document.txt"
    
    # Create markdown file
    cat > "$dir/${prefix}_readme.md" << EOF
# Sample Markdown in $prefix

This is a **markdown** file with *formatting*.

## Features
- Bullet point 1
- Bullet point 2
- Bullet point 3

### Code Example
\`\`\`python
def hello():
    print('Hello from $prefix')
\`\`\`
EOF
    
    # Create CSV file
    cat > "$dir/${prefix}_data.csv" << EOF
Name,Department,Email,Phone
John Doe,$prefix,john.doe@example.com,555-0101
Jane Smith,$prefix,jane.smith@example.com,555-0102
Bob Johnson,$prefix,bob.johnson@example.com,555-0103
EOF
    
    # Create HTML file
    cat > "$dir/${prefix}_page.html" << EOF
<!DOCTYPE html>
<html>
<head>
    <title>$prefix Document</title>
</head>
<body>
    <h1>Welcome to $prefix</h1>
    <p>This is a sample HTML document for testing.</p>
    <ul>
        <li>Item 1</li>
        <li>Item 2</li>
        <li>Item 3</li>
    </ul>
</body>
</html>
EOF
    
    # Create JSON file
    cat > "$dir/${prefix}_data.json" << EOF
{
    "department": "$prefix",
    "employees": [
        {"name": "Alice", "role": "Manager"},
        {"name": "Bob", "role": "Developer"},
        {"name": "Charlie", "role": "Designer"}
    ],
    "created": "$(date -I)"
}
EOF
}

# Create public share structure
echo "Creating public share..."
mkdir -p "$BASE_DIR/public"/{announcements,policies,templates}
create_sample_files "$BASE_DIR/public" "public"
create_sample_files "$BASE_DIR/public/announcements" "announcement"
create_sample_files "$BASE_DIR/public/policies" "policy"

cat > "$BASE_DIR/public/policies/company_policy.txt" << EOF
Company Policy Document

1. Work Hours: 9 AM - 5 PM
2. Vacation Policy: 20 days per year
3. Remote Work: 2 days per week allowed
4. Code of Conduct: Professional behavior expected
5. Security: All data must be encrypted
EOF

# Create documents share structure
echo "Creating documents share..."
mkdir -p "$BASE_DIR/documents"/{projects,reports,presentations}
create_sample_files "$BASE_DIR/documents" "docs"
create_sample_files "$BASE_DIR/documents/projects" "project"
create_sample_files "$BASE_DIR/documents/reports" "report"

# Create private share structure
echo "Creating private share..."
mkdir -p "$BASE_DIR/private"/{confidential,personal}
create_sample_files "$BASE_DIR/private" "private"
echo "CONFIDENTIAL: This information is sensitive and should not be shared" > "$BASE_DIR/private/confidential/secret.txt"

# Create engineering share structure
echo "Creating engineering share..."
mkdir -p "$BASE_DIR/engineering"/{code,documentation,specs}
create_sample_files "$BASE_DIR/engineering" "eng"

cat > "$BASE_DIR/engineering/code/sample_script.py" << 'EOF'
#!/usr/bin/env python3
# Engineering sample script

def calculate_sum(a, b):
    """Calculate the sum of two numbers"""
    return a + b

def main():
    result = calculate_sum(10, 20)
    print(f'Sum: {result}')

if __name__ == '__main__':
    main()
EOF

# Create marketing share structure
echo "Creating marketing share..."
mkdir -p "$BASE_DIR/marketing"/{campaigns,assets,analytics}
create_sample_files "$BASE_DIR/marketing" "marketing"

cat > "$BASE_DIR/marketing/campaigns/q1_campaign.txt" << EOF
Marketing Campaign Q1 2024

Campaign Name: Spring Launch
Target Audience: Young professionals (25-35)
Budget: $50,000
Duration: 3 months (Jan-Mar)
Channels: Social Media, Email, Display Ads

Key Messages:
- Innovation and Quality
- Limited Time Offer
- Customer Success Stories
EOF

# Create nested directory structures for depth testing
echo "Creating nested structures..."
mkdir -p "$BASE_DIR/documents/projects/2024/q1/project-alpha/docs"
mkdir -p "$BASE_DIR/documents/projects/2024/q1/project-beta/src"
mkdir -p "$BASE_DIR/engineering/code/backend/api/v1"
mkdir -p "$BASE_DIR/engineering/code/frontend/components/ui"

# Add files at various depths
echo "# Project Alpha Documentation" > "$BASE_DIR/documents/projects/2024/q1/project-alpha/README.md"
echo '{"endpoints": ["/users", "/products", "/orders"]}' > "$BASE_DIR/engineering/code/backend/api/v1/endpoints.json"
echo "export const Button = () => <button>Click me</button>;" > "$BASE_DIR/engineering/code/frontend/components/ui/button.tsx"

# Create some test Word documents (as text files with .docx extension)
for i in {1..3}; do
    cat > "$BASE_DIR/documents/reports/quarterly_report_$i.docx" << EOF
Quarterly Report $i

Executive Summary
-----------------
Performance has been strong this quarter with revenue up 15%.

Key Metrics:
- Revenue: $1.2M
- Customers: 450
- Growth Rate: 15%
EOF
done

# Create some test Excel files (as CSV with .xlsx extension)
for i in {1..3}; do
    cat > "$BASE_DIR/documents/reports/financial_data_$i.xlsx" << EOF
Month,Revenue,Expenses,Profit
January,100000,80000,20000
February,120000,85000,35000
March,115000,82000,33000
EOF
done

# Create a summary file
cat > "$BASE_DIR/README.txt" << EOF
SMB Test Server Data Structure
==============================

This test data simulates a typical corporate file share structure.

Share Directories:
------------------
- public/       : Company-wide announcements, policies, and templates
- documents/    : General documents, projects, reports, presentations
- private/      : Restricted access confidential files
- engineering/  : Engineering department files (code, docs, specs)
- marketing/    : Marketing department files (campaigns, assets, analytics)

Test Users (configure in docker-compose.yml):
--------------------------------------------
- testuser1 (password123) - Read/Write access
- testuser2 (password456) - Read/Write access  
- readonly (readonly123)  - Read-only access
- admin (admin123)       - Full admin access

File Types Included:
-------------------
- Text files (.txt)
- Markdown files (.md)
- CSV files (.csv)
- HTML files (.html)
- JSON files (.json)
- Python scripts (.py)
- Mock Word documents (.docx)
- Mock Excel files (.xlsx)
- TypeScript files (.tsx)

Directory Depth:
----------------
Maximum nesting: 6 levels deep
Example: /documents/projects/2024/q1/project-alpha/docs/

Total Structure:
----------------
$(find "$BASE_DIR" -type f | wc -l) files
$(find "$BASE_DIR" -type d | wc -l) directories
EOF

# Set executable permissions on Python scripts
chmod +x "$BASE_DIR/engineering/code/sample_script.py"

echo "SMB test data setup complete!"
echo "Total files created: $(find "$BASE_DIR" -type f | wc -l)"
echo "Total directories created: $(find "$BASE_DIR" -type d | wc -l)"
echo ""
echo "To use this data:"
echo "1. Run this script: ./setup-testdata.sh"
echo "2. Start the SMB server: docker-compose up -d"
echo "3. Connect using: smbclient //localhost/[share] -p 10445 -U testuser1"