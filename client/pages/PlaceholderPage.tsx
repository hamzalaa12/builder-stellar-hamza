import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Construction, ArrowRight } from "lucide-react";

interface PlaceholderPageProps {
  title: string;
  description: string;
  suggestions?: string[];
}

export default function PlaceholderPage({
  title,
  description,
  suggestions = [],
}: PlaceholderPageProps) {
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
        <Card className="max-w-md w-full">
          <CardContent className="p-8">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Construction className="h-8 w-8 text-primary" />
            </div>

            <h1 className="text-2xl font-bold mb-2">{title}</h1>
            <p className="text-muted-foreground mb-6">{description}</p>

            {suggestions.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm font-medium">يمكنك الآن:</p>
                <div className="space-y-2">
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 text-sm text-muted-foreground"
                    >
                      <ArrowRight className="h-3 w-3" />
                      {suggestion}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button className="mt-6" onClick={() => window.history.back()}>
              العودة للخلف
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
