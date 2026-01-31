import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/components/AppSidebar";
import type { ReactNode } from "react";
import SiteHeader from "@/components/SiteHeader";

const Layout = ({ children }: { children: ReactNode }) => {
    return (
        <div className="[--header-height:calc(--spacing(14))]">
            <SidebarProvider className="flex flex-col">
                <SiteHeader />
                <div className="flex flex-1">
                    <AppSidebar />
                    <SidebarInset>
                        <main>{children}</main>
                    </SidebarInset>
                </div>
            </SidebarProvider>
        </div>
    );
};

export default Layout;
