'use client';

import { Sidebar, Menu, MenuItem, Submenu, Logo } from "react-mui-sidebar";
import CottageOutlinedIcon from "@mui/icons-material/CottageOutlined";

import Link from "next/link";

const AppSidebar = () => {
  return (
    <Sidebar width={"270px"}>
      <Logo
        component={Link}  // Passing link to component for routing
        href="/"
        img="https://adminmart.com/wp-content/uploads/2024/03/logo-admin-mart-news.png"
      >
        AdminMart
      </Logo>
      <Menu subHeading="HOME">
        <MenuItem
          icon={<CottageOutlinedIcon />}
          component={Link} // Passing link to component for routing
          link="/tes"
          badge={true}
          isSelected={true}
        >
          {" "}
          {/* text for your link */}
          Link Text
        </MenuItem>
      </Menu>
    </Sidebar>
  );
};

export default AppSidebar;