import { ArrowLeft, DollarSign, Users, Bell, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { StatusTag } from "../components/StatusTag";
import { BalanceBadge } from "../components/BalanceBadge";
import { ProgressBar } from "../components/ProgressBar";
import { ReminderBadge } from "../components/ReminderBadge";
import { GroupMemberRow } from "../components/GroupMemberRow";
import { LoanCard } from "../components/LoanCard";
import { EmptyState } from "../components/EmptyState";

export function DesignSystem() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-12">
      {/* Header */}
      <header className="bg-primary text-primary-foreground px-4 py-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="text-primary-foreground hover:bg-primary-foreground/10"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-lg">Design System</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-12">
        {/* Colors */}
        <section>
          <h2 className="text-xl mb-4">Colors</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="h-20 rounded-lg bg-primary mb-2"></div>
              <p className="text-sm">Primary (Deep Blue)</p>
              <p className="text-xs text-muted-foreground">Trust & Action</p>
            </div>
            <div>
              <div className="h-20 rounded-lg bg-success mb-2"></div>
              <p className="text-sm">Success (Soft Green)</p>
              <p className="text-xs text-muted-foreground">Repayments</p>
            </div>
            <div>
              <div className="h-20 rounded-lg bg-warning mb-2"></div>
              <p className="text-sm">Warning (Muted Amber)</p>
              <p className="text-xs text-muted-foreground">Overdue</p>
            </div>
            <div>
              <div className="h-20 rounded-lg bg-destructive mb-2"></div>
              <p className="text-sm">Error (Soft Red)</p>
              <p className="text-xs text-muted-foreground">Critical</p>
            </div>
          </div>
        </section>

        {/* Typography */}
        <section>
          <h2 className="text-xl mb-4">Typography</h2>
          <div className="space-y-4 bg-card border border-border rounded-lg p-6">
            <h1>Heading 1 - Large Title</h1>
            <h2>Heading 2 - Section Title</h2>
            <h3>Heading 3 - Card Title</h3>
            <h4>Heading 4 - Small Title</h4>
            <p className="text-base">Body text - Regular paragraph content</p>
            <p className="text-sm text-muted-foreground">
              Small text - Helper text and descriptions
            </p>
            <p className="text-2xl tabular-nums">$1,234.56 - Money Display</p>
          </div>
        </section>

        {/* Buttons */}
        <section>
          <h2 className="text-xl mb-4">Buttons</h2>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <Button>Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button size="lg">Large</Button>
              <Button>Default</Button>
              <Button size="sm">Small</Button>
              <Button size="icon">
                <Check className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button disabled>Disabled</Button>
              <Button>
                <DollarSign className="w-4 h-4 mr-2" />
                With Icon
              </Button>
            </div>
          </div>
        </section>

        {/* Form Elements */}
        <section>
          <h2 className="text-xl mb-4">Form Elements</h2>
          <div className="space-y-4 max-w-md">
            <div>
              <Label htmlFor="text-input">Text Input</Label>
              <Input
                id="text-input"
                type="text"
                placeholder="Enter text..."
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="number-input">Number Input</Label>
              <Input
                id="number-input"
                type="number"
                placeholder="0"
                className="mt-1.5"
              />
              <p className="text-xs text-muted-foreground mt-1.5">
                Helper text goes here
              </p>
            </div>
            <div>
              <Label htmlFor="date-input">Date Input</Label>
              <Input
                id="date-input"
                type="date"
                className="mt-1.5"
              />
            </div>
          </div>
        </section>

        {/* Status Tags */}
        <section>
          <h2 className="text-xl mb-4">Status Tags</h2>
          <div className="flex flex-wrap gap-3">
            <StatusTag status="active" />
            <StatusTag status="partial" />
            <StatusTag status="completed" />
            <StatusTag status="overdue" />
          </div>
        </section>

        {/* Balance Badges */}
        <section>
          <h2 className="text-xl mb-4">Balance Badges</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl">
            <BalanceBadge
              amount={1500}
              label="Owed to you"
              variant="owed-to-you"
            />
            <BalanceBadge
              amount={750}
              label="You owe"
              variant="you-owe"
            />
            <BalanceBadge
              amount={2250}
              label="Total"
              variant="neutral"
            />
          </div>
        </section>

        {/* Progress Bar */}
        <section>
          <h2 className="text-xl mb-4">Progress Bar</h2>
          <div className="space-y-6 max-w-md">
            <ProgressBar value={250} max={1000} />
            <ProgressBar value={750} max={1000} />
            <ProgressBar value={1000} max={1000} />
          </div>
        </section>

        {/* Reminder Badge */}
        <section>
          <h2 className="text-xl mb-4">Reminder Badge</h2>
          <div className="flex flex-wrap gap-3">
            <ReminderBadge count={1} />
            <ReminderBadge count={3} />
          </div>
        </section>

        {/* Group Member Row */}
        <section>
          <h2 className="text-xl mb-4">Group Member Row</h2>
          <div className="space-y-3 max-w-md">
            <GroupMemberRow name="Sarah Chen" balance={150} isPositive={true} />
            <GroupMemberRow name="Marcus Johnson" balance={-200} isPositive={false} />
          </div>
        </section>

        {/* Loan Card */}
        <section>
          <h2 className="text-xl mb-4">Loan Card</h2>
          <div className="space-y-3 max-w-md">
            <LoanCard
              id="demo-1"
              borrowerName="Sarah Chen"
              amount={500}
              remainingAmount={500}
              dueDate="2026-02-20"
              status="active"
              type="personal"
              isLender={true}
            />
            <LoanCard
              id="demo-2"
              borrowerName="Marcus Johnson"
              amount={1200}
              remainingAmount={600}
              dueDate="2026-02-15"
              status="partial"
              type="business"
              isLender={true}
            />
            <LoanCard
              id="demo-3"
              borrowerName="Emma Wilson"
              amount={300}
              remainingAmount={0}
              dueDate="2026-01-30"
              status="completed"
              type="personal"
              isLender={false}
            />
          </div>
        </section>

        {/* Empty State */}
        <section>
          <h2 className="text-xl mb-4">Empty State</h2>
          <div className="bg-card border border-border rounded-lg">
            <EmptyState
              icon={Users}
              title="No items yet"
              description="This is what users see when there's no content to display"
              actionLabel="Add Item"
              onAction={() => alert("Action clicked")}
            />
          </div>
        </section>

        {/* Icons */}
        <section>
          <h2 className="text-xl mb-4">Icons</h2>
          <div className="flex flex-wrap gap-4">
            <div className="flex flex-col items-center gap-2">
              <DollarSign className="w-6 h-6" />
              <span className="text-xs">DollarSign</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Users className="w-6 h-6" />
              <span className="text-xs">Users</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Bell className="w-6 h-6" />
              <span className="text-xs">Bell</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Check className="w-6 h-6" />
              <span className="text-xs">Check</span>
            </div>
          </div>
        </section>

        {/* Spacing */}
        <section>
          <h2 className="text-xl mb-4">Spacing (8pt system)</h2>
          <div className="space-y-2 bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 text-sm text-muted-foreground">4px</div>
              <div className="h-4 w-4 bg-primary rounded"></div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-16 text-sm text-muted-foreground">8px</div>
              <div className="h-4 w-8 bg-primary rounded"></div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-16 text-sm text-muted-foreground">16px</div>
              <div className="h-4 w-16 bg-primary rounded"></div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-16 text-sm text-muted-foreground">24px</div>
              <div className="h-4 w-24 bg-primary rounded"></div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-16 text-sm text-muted-foreground">32px</div>
              <div className="h-4 w-32 bg-primary rounded"></div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
